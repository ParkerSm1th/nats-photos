import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { PRESIGNED_UPLOAD_EXPIRY_SECONDS } from "@/server/upload/photo-upload-steps";
import { S3Service } from "@/server/api/services/S3Service/S3Service";
import { prisma } from "@/server/db";
import { processPhotoUpload } from "@/workflows/process-photo-upload";
import { resumeHook, start } from "workflow/api";

const s3Service = new S3Service("natalies-photos");

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(_request);
  if (!authResult.ok) {
    return authResult.response;
  }

  const { id: uploadId } = await params;

  const upload = await prisma.photoUpload.findUnique({
    where: { id: uploadId },
  });

  if (!upload) {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 });
  }

  if (upload.status !== "FAILED") {
    return NextResponse.json(
      { error: "Only failed uploads can be retried" },
      { status: 409 }
    );
  }

  await prisma.photoUpload.update({
    where: { id: uploadId },
    data: {
      status: "QUEUED",
      progress: 0,
      errorMessage: null,
    },
  });

  const run = await start(processPhotoUpload, [uploadId, upload.showId]);

  await prisma.photoUpload.update({
    where: { id: uploadId },
    data: {
      workflowRunId: run.runId,
      status: "UPLOADING_ORIGINAL",
      progress: 10,
    },
  });

  const originalKey = `${uploadId}.jpg`;
  const originalExists = Boolean(await s3Service.headObject(originalKey));

  if (originalExists) {
    try {
      await resumeHook(`upload-${uploadId}`, { uploadId });
      return NextResponse.json({
        uploadId,
        batchId: upload.batchId,
        runId: run.runId,
        needsClientUpload: false,
        presignedUrl: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Resume failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  const presignedUrl = s3Service.getPresignedUploadLink(
    { key: originalKey, type: "image/jpeg" },
    PRESIGNED_UPLOAD_EXPIRY_SECONDS
  );

  return NextResponse.json({
    uploadId,
    batchId: upload.batchId,
    runId: run.runId,
    needsClientUpload: true,
    presignedUrl,
  });
}

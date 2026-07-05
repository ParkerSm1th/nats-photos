import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { PRESIGNED_UPLOAD_EXPIRY_SECONDS } from "@/server/upload/photo-upload-steps";
import { S3Service } from "@/server/api/services/S3Service/S3Service";
import { prisma } from "@/server/db";
import { processPhotoUpload } from "@/workflows/process-photo-upload";
import { start } from "workflow/api";

const s3Service = new S3Service("natalies-photos");

const startSchema = z.object({
  showId: z.string().uuid(),
  fileName: z.string().min(1),
  uploadId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const authResult = await requireAdmin(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { showId, fileName, uploadId, batchId: existingBatchId } = parsed.data;

  const show = await prisma.show.findUnique({ where: { id: showId } });
  if (!show) {
    return NextResponse.json({ error: "Show not found" }, { status: 404 });
  }

  let batchId = existingBatchId;
  if (batchId) {
    const batch = await prisma.photoUploadBatch.findFirst({
      where: { id: batchId, showId },
    });
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }
  } else {
    const batch = await prisma.photoUploadBatch.create({
      data: {
        showId,
        createdBy: authResult.userId,
      },
    });
    batchId = batch.id;
  }

  const existingUpload = await prisma.photoUpload.findUnique({
    where: { id: uploadId },
  });
  if (existingUpload) {
    return NextResponse.json(
      { error: "Upload already exists" },
      { status: 409 }
    );
  }

  await prisma.photoUpload.create({
    data: {
      id: uploadId,
      batchId,
      showId,
      fileName,
      status: "QUEUED",
      progress: 0,
    },
  });

  const run = await start(processPhotoUpload, [uploadId, showId]);

  await prisma.photoUpload.update({
    where: { id: uploadId },
    data: {
      workflowRunId: run.runId,
      status: "UPLOADING_ORIGINAL",
      progress: 10,
    },
  });

  const presignedUrl = s3Service.getPresignedUploadLink(
    { key: `${uploadId}.jpg`, type: "image/jpeg" },
    PRESIGNED_UPLOAD_EXPIRY_SECONDS
  );

  return NextResponse.json({
    uploadId,
    batchId,
    presignedUrl,
    runId: run.runId,
  });
}

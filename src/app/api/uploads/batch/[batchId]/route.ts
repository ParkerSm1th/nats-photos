import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/server/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const authResult = await requireAdmin(_request);
  if (!authResult.ok) {
    return authResult.response;
  }

  const { batchId } = await params;

  const batch = await prisma.photoUploadBatch.findUnique({
    where: { id: batchId },
    include: {
      uploads: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  const uploads = batch.uploads.map((upload) => ({
    id: upload.id,
    fileName: upload.fileName,
    showId: upload.showId,
    status: upload.status,
    progress: upload.progress,
    errorMessage: upload.errorMessage,
    photoId: upload.photoId,
    updatedAt: upload.updatedAt,
  }));

  const total = uploads.length;
  const completed = uploads.filter((u) => u.status === "COMPLETE").length;
  const failed = uploads.filter((u) => u.status === "FAILED").length;
  const isComplete = total > 0 && completed + failed === total;

  return NextResponse.json({
    batchId: batch.id,
    showId: batch.showId,
    createdAt: batch.createdAt,
    uploads,
    summary: {
      total,
      completed,
      failed,
      inProgress: total - completed - failed,
      isComplete,
    },
  });
}

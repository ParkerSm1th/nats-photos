import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/server/db";
import { resumeHook } from "workflow/api";

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

  if (upload.status === "COMPLETE") {
    return NextResponse.json({ ok: true, alreadyComplete: true });
  }

  if (upload.status === "FAILED") {
    return NextResponse.json(
      { error: "Upload failed — use retry endpoint" },
      { status: 409 }
    );
  }

  try {
    const result = await resumeHook(`upload-${uploadId}`, { uploadId });
    return NextResponse.json({ ok: true, runId: result.runId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Resume failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

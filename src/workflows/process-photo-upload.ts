import { createHook, FatalError } from "workflow";
import {
  createPhotoRecord,
  invalidateShowPhotosCache,
  markUploadFailed,
  updateUploadStatus,
  watermarkAndUploadPreview,
} from "@/server/upload/photo-upload-steps";

export async function processPhotoUpload(uploadId: string, showId: string) {
  "use workflow";

  await setUploadStatusStep(uploadId, "UPLOADING_ORIGINAL", 10);

  const hook = createHook({ token: `upload-${uploadId}` });
  await hook;

  await setUploadStatusStep(uploadId, "PROCESSING", 85);
  await watermarkAndUploadPreviewStep(uploadId);
  await createPhotoRecordStep(uploadId, showId);
  await invalidateShowCacheStep(showId);
  await setUploadStatusStep(uploadId, "COMPLETE", 100);
}

async function setUploadStatusStep(
  uploadId: string,
  status: Parameters<typeof updateUploadStatus>[1],
  progress: number
) {
  "use step";
  await updateUploadStatus(uploadId, status, progress);
}

async function watermarkAndUploadPreviewStep(uploadId: string) {
  "use step";
  try {
    await watermarkAndUploadPreview(uploadId);
  } catch (error) {
    if (!(error instanceof FatalError)) {
      await markUploadFailed(
        uploadId,
        error instanceof Error ? error.message : "Processing failed"
      );
    }
    throw error;
  }
}

async function createPhotoRecordStep(uploadId: string, showId: string) {
  "use step";
  await createPhotoRecord(uploadId, showId);
}

async function invalidateShowCacheStep(showId: string) {
  "use step";
  await invalidateShowPhotosCache(showId);
}

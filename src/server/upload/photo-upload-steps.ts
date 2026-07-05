import type { PhotoUploadStatus } from "@prisma/client";
import Jimp from "jimp";
import JPEG from "jpeg-js";
import { FatalError } from "workflow";
import { S3Service } from "@/server/api/services/S3Service/S3Service";
import { WatermarkService } from "@/server/api/services/WatermarkService/WatermarkService";
import {
  invalidateCache,
  reconnectRedis,
  getRedisStatus,
} from "@/server/api/utils/redis";
import { prisma } from "@/server/db";

export const MAX_ORIGINAL_BYTES = 50 * 1024 * 1024;
export const PRESIGNED_UPLOAD_EXPIRY_SECONDS = 300;
export const WATERMARK_LOGO_URL =
  "https://res.cloudinary.com/dqdjvho5d/image/upload/v1699069051/WhiteSmallLogo_kppgao.png";

const s3Service = new S3Service("natalies-photos");

export async function updateUploadStatus(
  uploadId: string,
  status: PhotoUploadStatus,
  progress: number,
  errorMessage?: string
) {
  await prisma.photoUpload.update({
    where: { id: uploadId },
    data: {
      status,
      progress,
      ...(errorMessage !== undefined ? { errorMessage } : {}),
    },
  });
}

export async function verifyOriginalOnS3(uploadId: string) {
  const key = `${uploadId}.jpg`;
  const head = await s3Service.headObject(key);
  if (!head) {
    throw new FatalError(`Original upload not found in S3: ${key}`);
  }
  if (head.contentLength > MAX_ORIGINAL_BYTES) {
    throw new FatalError(
      `Original file exceeds ${MAX_ORIGINAL_BYTES / (1024 * 1024)}MB limit`
    );
  }
  return head;
}

export async function watermarkAndUploadPreview(uploadId: string) {
  try {
    await verifyOriginalOnS3(uploadId);

    const originalBuffer = await s3Service.getObjectBuffer(`${uploadId}.jpg`);

    Jimp.decoders["image/jpeg"] = (data) =>
      JPEG.decode(data, { maxMemoryUsageInMB: 60000 });

    let image: Jimp;
    try {
      image = await Jimp.read(originalBuffer);
    } catch {
      throw new FatalError("Unable to decode image — file may be corrupt");
    }

    const watermarkService = new WatermarkService(
      await Jimp.read(WATERMARK_LOGO_URL)
    );
    const waterMarked = watermarkService.getWatermarkedImage(image);
    const previewUploadUrl = s3Service.getPresignedUploadLink(
      {
        key: `${uploadId}-watermark.jpg`,
        type: "image/jpeg",
      },
      PRESIGNED_UPLOAD_EXPIRY_SECONDS
    );

    const previewBuffer = await waterMarked.getBufferAsync(Jimp.MIME_JPEG);
    const response = await fetch(previewUploadUrl, {
      method: "PUT",
      headers: new Headers({ "Content-Type": "image/jpeg" }),
      body: previewBuffer,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to upload watermark preview: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    if (error instanceof FatalError) {
      await markUploadFailed(uploadId, error.message);
    }
    throw error;
  }
}

export async function createPhotoRecord(uploadId: string, showId: string) {
  const photo = await prisma.photo.upsert({
    where: { id: uploadId },
    update: {},
    create: { id: uploadId, showId },
  });

  await prisma.photoUpload.update({
    where: { id: uploadId },
    data: { photoId: photo.id, progress: 95 },
  });

  return photo;
}

export async function invalidateShowPhotosCache(showId: string) {
  if (!getRedisStatus()?.isOpen) {
    reconnectRedis();
  }
  await invalidateCache("showPhotosLinks", showId);
}

export async function markUploadFailed(uploadId: string, message: string) {
  await prisma.photoUpload.update({
    where: { id: uploadId },
    data: {
      status: "FAILED",
      errorMessage: message,
    },
  });
}

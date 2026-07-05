export type Show = {
  id: string;
  name: string;
  slug: string;
  location: string;
  startDate: Date;
  endDate?: Date | null;
  children?: Show[];
  createdAt: Date;
  updatedAt: Date;
};

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  image?: string | null;
};

export type UploadQueueItemStatus =
  | "queued"
  | "uploading"
  | "processing"
  | "complete"
  | "failed";

export type UploadQueueItem = {
  id: string;
  showId: string;
  file: File;
  status: UploadQueueItemStatus;
  progress: number;
  errorMessage?: string;
  batchId?: string;
};

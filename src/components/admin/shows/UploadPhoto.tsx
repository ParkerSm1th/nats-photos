import { faRotateRight, faTrash, faUpload } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../../ui/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/ui/dialog";
import { Badge } from "../../ui/ui/badge";
import { v4 as uuid } from "uuid";
import { Spinner } from "@/components/ui/ui/spinner";
import { useUploadQueue } from "@/providers/UploadsProvider";
import type { UploadQueueItemStatus } from "@/common/types";
import clsx from "clsx";

const statusLabels: Record<UploadQueueItemStatus, string> = {
  queued: "Queued",
  uploading: "Uploading",
  processing: "Processing",
  complete: "Done",
  failed: "Failed",
};

const statusVariants: Record<
  UploadQueueItemStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  queued: "outline",
  uploading: "secondary",
  processing: "secondary",
  complete: "default",
  failed: "destructive",
};

export const UploadPhotoDialog = ({
  className,
  open,
  onClose,
  showId,
}: React.HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  onClose: () => void;
  showId: string;
}) => {
  const {
    queue,
    addToQueue,
    removeFromQueue,
    triggerUpload,
    retryUpload,
    isUploading,
  } = useUploadQueue();

  const showItems = queue.filter((i) => i.showId === showId);
  const uploading = isUploading(showId);
  const hasQueued = showItems.some((i) => i.status === "queued");

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className={`sm:max-w-[625px] ${className ?? ""}`}>
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <div className="mt-4 flex w-full items-center justify-center">
            <label
              htmlFor="dropzone-file"
              className={clsx(
                "dark:hover:bg-bray-800 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600",
                { "pointer-events-none opacity-50": uploading }
              )}
            >
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                <FontAwesomeIcon
                  icon={faUpload}
                  className="mb-2 h-6 w-6 text-gray-500"
                />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                multiple
                disabled={uploading}
                onChange={(e) => {
                  const localFiles = Array.from(e.target.files ?? []);
                  const newFiles = localFiles.map((file) => ({
                    id: uuid(),
                    showId,
                    file,
                    status: "queued" as const,
                    progress: 0,
                  }));
                  addToQueue(newFiles);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <div className="mt-4 h-[300px] overflow-y-auto">
            {showItems.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No photos in queue.
                </p>
              </div>
            )}
            {showItems.map((file) => {
              const isActive =
                file.status === "uploading" || file.status === "processing";
              return (
                <div
                  className="mt-3 rounded-md border border-slate-100 p-3"
                  key={file.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">
                      {file.file.name}
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={statusVariants[file.status]}>
                        {statusLabels[file.status]}
                      </Badge>
                      {file.status === "failed" && (
                        <button
                          type="button"
                          className="text-purple-600 hover:text-purple-800"
                          title="Retry"
                          onClick={() => void retryUpload(file.id)}
                        >
                          <FontAwesomeIcon
                            icon={faRotateRight}
                            className="h-4 w-4"
                          />
                        </button>
                      )}
                      {!isActive && file.status !== "complete" && (
                        <button
                          type="button"
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => removeFromQueue(file.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                        </button>
                      )}
                      {isActive && (
                        <Spinner className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all duration-300",
                        file.status === "failed"
                          ? "bg-red-400"
                          : "bg-purple-500"
                      )}
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  {file.errorMessage && (
                    <p className="mt-1 text-xs text-red-600">
                      {file.errorMessage}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <Button
            className="mx-auto mt-4 flex"
            onClick={() => void triggerUpload(showId)}
            disabled={uploading || !hasQueued}
          >
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

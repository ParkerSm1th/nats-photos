import React, {
  createContext,
  type FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { UploadQueueItem, UploadQueueItemStatus } from "@/common/types";
import { Badge } from "@/components/ui/ui/badge";
import { Button } from "@/components/ui/ui/button";
import { toast } from "@/components/ui/ui/use-toast";
import { api } from "@/utils/api";
import { AnimatePresence, motion } from "framer-motion";
import { faChevronDown, faChevronUp } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const UPLOAD_CONCURRENCY = 3;
const POLL_INTERVAL_MS = 1500;

type BatchStatusResponse = {
  batchId: string;
  showId: string;
  uploads: Array<{
    id: string;
    fileName: string;
    status: string;
    progress: number;
    errorMessage: string | null;
  }>;
  summary: {
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
    isComplete: boolean;
  };
};

function mapServerStatus(status: string): UploadQueueItemStatus {
  switch (status) {
    case "QUEUED":
    case "UPLOADING_ORIGINAL":
      return status === "UPLOADING_ORIGINAL" ? "uploading" : "queued";
    case "PROCESSING":
      return "processing";
    case "COMPLETE":
      return "complete";
    case "FAILED":
      return "failed";
    default:
      return "queued";
  }
}

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", "image/jpeg");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const ratio = event.loaded / event.total;
      const percent = Math.round(10 + ratio * 70);
      onProgress(Math.min(80, percent));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(80);
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload aborted"));
    xhr.send(file);
  });
}

type ContextType = {
  queue: UploadQueueItem[];
  addToQueue: (items: UploadQueueItem[]) => void;
  removeFromQueue: (id: string) => void;
  setQueue: (items: UploadQueueItem[]) => void;
  triggerUpload: (showId: string) => Promise<void>;
  retryUpload: (id: string) => Promise<void>;
  activeShowId: string | null;
  isUploading: (showId: string) => boolean;
};

const Context = createContext<ContextType>({
  queue: [],
  addToQueue: () => {},
  removeFromQueue: () => {},
  setQueue: () => {},
  triggerUpload: async () => {},
  retryUpload: async () => {},
  activeShowId: null,
  isUploading: () => false,
});

export const useUploadQueue = () => useContext(Context);

interface Props {
  children: React.ReactNode;
}

export const UploadsProvider: FC<Props> = ({ children }) => {
  const [queue, setQueueLocal] = useState<UploadQueueItem[]>([]);
  const [activeShowId, setActiveShowId] = useState<string | null>(null);
  const [toastExpanded, setToastExpanded] = useState(false);
  const pollingRef = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map()
  );
  const invalidatedBatchesRef = useRef<Set<string>>(new Set());
  const utils = api.useContext();

  const updateQueueItem = useCallback(
    (id: string, patch: Partial<UploadQueueItem>) => {
      setQueueLocal((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
      );
    },
    []
  );

  const addToQueue = useCallback((items: UploadQueueItem[]) => {
    setQueueLocal((prev) => {
      const itemsToAdd = items.filter(
        (item) =>
          !prev.some(
            (existing) =>
              existing.id === item.id || existing.file.name === item.file.name
          )
      );
      return [
        ...prev,
        ...itemsToAdd.map((item) => ({
          ...item,
          status: item.status ?? "queued",
          progress: item.progress ?? 0,
        })),
      ];
    });
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueueLocal((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item || item.status === "uploading" || item.status === "processing") {
        return prev;
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const setQueue = useCallback((items: UploadQueueItem[]) => {
    setQueueLocal(items);
  }, []);

  const invalidateGallery = useCallback(
    async (showId: string) => {
      await utils.shows.getShowPhotos.invalidate({ id: showId });
      await utils.shows.invalidateShowPhotosLinksCache.mutate({ id: showId });
    },
    [utils]
  );

  const pollBatch = useCallback(
    async (batchId: string, showId: string) => {
      try {
        const response = await fetch(`/api/uploads/batch/${batchId}`);
        if (!response.ok) return;
        const data = (await response.json()) as BatchStatusResponse;

        setQueueLocal((prev) =>
          prev.map((item) => {
            const serverUpload = data.uploads.find((u) => u.id === item.id);
            if (!serverUpload) return item;
            return {
              ...item,
              batchId,
              status: mapServerStatus(serverUpload.status),
              progress: serverUpload.progress,
              errorMessage: serverUpload.errorMessage ?? undefined,
            };
          })
        );

        if (
          data.summary.isComplete &&
          !invalidatedBatchesRef.current.has(batchId)
        ) {
          invalidatedBatchesRef.current.add(batchId);
          await invalidateGallery(showId);

          if (data.summary.failed > 0) {
            toast({
              variant: "destructive",
              title: "Some uploads failed",
              description: `${data.summary.failed} of ${data.summary.total} photos failed to upload.`,
            });
          } else if (data.summary.completed > 0) {
            toast({
              title: "Upload complete",
              description: `${data.summary.completed} photos added to the gallery.`,
            });
          }

          const interval = pollingRef.current.get(batchId);
          if (interval) {
            clearInterval(interval);
            pollingRef.current.delete(batchId);
          }
        }
      } catch (error) {
        console.error("Batch poll failed:", error);
      }
    },
    [invalidateGallery]
  );

  const startBatchPolling = useCallback(
    (batchId: string, showId: string) => {
      if (pollingRef.current.has(batchId)) return;
      void pollBatch(batchId, showId);
      const interval = setInterval(() => {
        void pollBatch(batchId, showId);
      }, POLL_INTERVAL_MS);
      pollingRef.current.set(batchId, interval);
    },
    [pollBatch]
  );

  const processUpload = useCallback(
    async (item: UploadQueueItem, batchId: string | undefined) => {
      updateQueueItem(item.id, { status: "uploading", progress: 0 });

      const startResponse = await fetch("/api/uploads/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: item.showId,
          fileName: item.file.name,
          uploadId: item.id,
          batchId,
        }),
      });

      if (!startResponse.ok) {
        const errorBody = (await startResponse.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errorBody.error ?? "Failed to start upload");
      }

      const startData = (await startResponse.json()) as {
        uploadId: string;
        batchId: string;
        presignedUrl: string;
      };

      updateQueueItem(item.id, {
        batchId: startData.batchId,
        progress: 10,
      });

      startBatchPolling(startData.batchId, item.showId);

      await uploadWithProgress(startData.presignedUrl, item.file, (progress) => {
        updateQueueItem(item.id, { progress });
      });

      const completeResponse = await fetch(
        `/api/uploads/${startData.uploadId}/original-complete`,
        { method: "POST" }
      );

      if (!completeResponse.ok) {
        const errorBody = (await completeResponse.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errorBody.error ?? "Failed to signal upload complete");
      }

      updateQueueItem(item.id, { status: "processing", progress: 80 });
      return startData.batchId;
    },
    [startBatchPolling, updateQueueItem]
  );

  const triggerUpload = useCallback(
    async (showId: string) => {
      let pendingItems: UploadQueueItem[] = [];
      setQueueLocal((prev) => {
        pendingItems = prev.filter(
          (item) => item.showId === showId && item.status === "queued"
        );
        return prev;
      });
      if (pendingItems.length === 0) return;

      setActiveShowId(showId);
      let sharedBatchId: string | undefined;

      const runWithConcurrency = async () => {
        const executing = new Set<Promise<void>>();

        for (const item of pendingItems) {
          const task = (async () => {
            try {
              const batchId = await processUpload(item, sharedBatchId);
              sharedBatchId = batchId;
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "Upload failed";
              updateQueueItem(item.id, {
                status: "failed",
                errorMessage: message,
              });
              toast({
                variant: "destructive",
                title: "Upload failed",
                description: `${item.file.name}: ${message}`,
              });
            }
          })();

          executing.add(task);
          void task.finally(() => executing.delete(task));

          if (executing.size >= UPLOAD_CONCURRENCY) {
            await Promise.race(executing);
          }
        }

        await Promise.all(executing);
      };

      await runWithConcurrency();

      setActiveShowId((current) => (current === showId ? null : current));
    },
    [processUpload, updateQueueItem]
  );

  const retryUpload = useCallback(
    async (id: string) => {
      const item = queue.find((q) => q.id === id);
      if (!item) return;

      updateQueueItem(id, {
        status: "uploading",
        progress: 0,
        errorMessage: undefined,
      });

      try {
        const response = await fetch(`/api/uploads/${id}/retry`, {
          method: "POST",
        });
        if (!response.ok) {
          const errorBody = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(errorBody.error ?? "Retry failed");
        }

        const data = (await response.json()) as {
          batchId: string;
          needsClientUpload: boolean;
          presignedUrl: string | null;
        };

        if (data.batchId) {
          startBatchPolling(data.batchId, item.showId);
        }

        if (data.needsClientUpload && data.presignedUrl) {
          await uploadWithProgress(data.presignedUrl, item.file, (progress) => {
            updateQueueItem(id, { progress });
          });
          const completeResponse = await fetch(
            `/api/uploads/${id}/original-complete`,
            { method: "POST" }
          );
          if (!completeResponse.ok) {
            throw new Error("Failed to signal upload complete after retry");
          }
        }

        updateQueueItem(id, { status: "processing", progress: 80 });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Retry failed";
        updateQueueItem(id, { status: "failed", errorMessage: message });
        toast({
          variant: "destructive",
          title: "Retry failed",
          description: `${item.file.name}: ${message}`,
        });
      }
    },
    [queue, startBatchPolling, updateQueueItem]
  );

  useEffect(() => {
    const polling = pollingRef.current;
    return () => {
      polling.forEach((interval) => clearInterval(interval));
      polling.clear();
    };
  }, []);

  const showQueue = activeShowId
    ? queue.filter((item) => item.showId === activeShowId)
    : queue.filter(
        (item) =>
          item.status === "uploading" ||
          item.status === "processing" ||
          item.status === "failed"
      );

  const showUploadCount = showQueue.length;
  const showCompletedCount = showQueue.filter(
    (item) => item.status === "complete"
  ).length;
  const showOverallProgress =
    showUploadCount === 0
      ? 0
      : Math.round(
          showQueue.reduce((sum, item) => sum + item.progress, 0) /
            showUploadCount
        );

  const isUploading = useCallback(
    (showId: string) =>
      queue.some(
        (item) =>
          item.showId === showId &&
          (item.status === "uploading" || item.status === "processing")
      ),
    [queue]
  );

  const value = useMemo<ContextType>(
    () => ({
      queue,
      addToQueue,
      removeFromQueue,
      setQueue,
      triggerUpload,
      retryUpload,
      activeShowId,
      isUploading,
    }),
    [
      queue,
      addToQueue,
      removeFromQueue,
      setQueue,
      triggerUpload,
      retryUpload,
      activeShowId,
      isUploading,
    ]
  );

  const hasActiveUploads = showQueue.some(
    (item) =>
      item.status === "uploading" ||
      item.status === "processing" ||
      item.status === "failed"
  );

  return (
    <Context.Provider value={value}>
      <AnimatePresence>
        {hasActiveUploads && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50 w-80 rounded-md border border-slate-200 bg-white p-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Uploading {showCompletedCount} of {showUploadCount} photos…
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setToastExpanded((v) => !v)}
              >
                {toastExpanded ? (
                  <FontAwesomeIcon icon={faChevronDown} className="h-3 w-3" />
                ) : (
                  <FontAwesomeIcon icon={faChevronUp} className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-300"
                style={{ width: `${showOverallProgress}%` }}
              />
            </div>
            {toastExpanded && (
              <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
                {showQueue.map((item) => (
                  <div key={item.id} className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{item.file.name}</span>
                      <UploadStatusBadge status={item.status} />
                    </div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-purple-400 transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    {item.errorMessage && (
                      <p className="mt-1 text-red-600">{item.errorMessage}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </Context.Provider>
  );
};

function UploadStatusBadge({ status }: { status: UploadQueueItemStatus }) {
  const labels: Record<UploadQueueItemStatus, string> = {
    queued: "Queued",
    uploading: "Uploading",
    processing: "Processing",
    complete: "Done",
    failed: "Failed",
  };
  const variants: Record<
    UploadQueueItemStatus,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    queued: "outline",
    uploading: "secondary",
    processing: "secondary",
    complete: "default",
    failed: "destructive",
  };
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

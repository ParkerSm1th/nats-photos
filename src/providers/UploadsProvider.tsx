import React, {
  createContext,
  type FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { UploadQueueItem } from "@/common/types";
import { api } from "@/utils/api";
import imageCompression from "browser-image-compression";
import { AnimatePresence, motion } from "framer-motion";
import { Spinner } from "@/components/ui/ui/spinner";

type ContextType = {
  queue: UploadQueueItem[];
  addToQueue: (items: UploadQueueItem[]) => void;
  removeFromQueue: (id: string) => void;
  setQueue: (items: UploadQueueItem[]) => void;
  triggerUpload: () => Promise<void>;
  loading: boolean;
};

const Context = createContext<ContextType>({
  queue: [],
  addToQueue: () => {},
  removeFromQueue: () => {},
  setQueue: () => {},
  triggerUpload: () => Promise.resolve(),
  loading: false,
});

export const useUploadQueue = () => useContext(Context);

interface Props {
  children: React.ReactNode;
}
export const UploadsProvider: FC<Props> = ({ children }) => {
  const [queue, setQueueLocal] = useState<UploadQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const generateLink = api.shows.getPresignedUploadLink.useMutation();
  const addPhoto = api.shows.addPhoto.useMutation();

  const addToQueue = useCallback(
    (items: UploadQueueItem[]) => {
      const itemsToAdd: UploadQueueItem[] = [];
      items.map((item) => {
        if (
          queue.find((i) => i.id === item.id || i.file.name === item.file.name)
        )
          return;
        itemsToAdd.push(item);
      });
      const newQueue = [...queue, ...itemsToAdd];
      setQueueLocal(newQueue);
    },
    [queue]
  );

  const removeFromQueue = useCallback(
    (id: string) => {
      if (!queue.find((i) => i.id === id)) return;
      const newQueue = queue.filter((i) => i.id !== id);
      setQueueLocal(newQueue);
    },
    [queue]
  );

  const setQueue = useCallback((items: UploadQueueItem[]) => {
    setQueueLocal(items);
  }, []);

  const triggerUpload = useCallback(async () => {
    setLoading(true);
    for (const newFile of queue) {
      const link = await generateLink.mutateAsync({
        photoKey: `${newFile.id}.jpg`,
        type: "image/jpeg",
      });
      try {
        await fetch(link.url, {
          method: "PUT",
          headers: new Headers({ "Content-Type": "image/jpeg" }),
          body: newFile.file,
        });
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1000,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(newFile.file, options);
        await addPhoto.mutateAsync({
          showId: newFile.showId,
          photoId: newFile.id,
          base64: await compressedFile
            .arrayBuffer()
            .then((buffer) => Buffer.from(buffer).toString("base64")),
        });
        removeFromQueue(newFile.id);
      } catch (err) {
        console.error(err);
        removeFromQueue(newFile.id);
      }
    }
    setLoading(false);
  }, [addPhoto, generateLink, queue, removeFromQueue]);

  const value = useMemo<ContextType>(
    () => ({
      queue,
      addToQueue,
      removeFromQueue,
      setQueue,
      triggerUpload,
      loading,
    }),
    [queue, addToQueue, removeFromQueue, setQueue, triggerUpload, loading]
  );

  return (
    <Context.Provider value={value}>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="absolute bottom-4 right-4 flex items-start justify-center rounded-md border-2 border-slate-100 bg-white p-4 align-middle shadow-md"
          >
            <Spinner className="h-6 w-6" />
            <p className="ml-2">Uploading.. {queue.length} photos left.</p>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </Context.Provider>
  );
};

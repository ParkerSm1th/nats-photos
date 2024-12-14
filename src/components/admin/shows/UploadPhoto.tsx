import { faTrash, faUpload } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../../ui/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/ui/dialog";
import { v4 as uuid } from "uuid";
import { Spinner } from "@/components/ui/ui/spinner";
import { useUploadQueue } from "@/providers/UploadsProvider";
import clsx from "clsx";

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
  const { queue, addToQueue, removeFromQueue, triggerUpload, loading } =
    useUploadQueue();

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onClose();
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className={`sm:max-w-[625px] ${className}`}>
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
        </DialogHeader>
        {/* Input dropzone for multiple files */}
        <div className="mt-2">
          <div className="mt-4 flex w-full items-center justify-center">
            <label
              htmlFor="dropzone-file"
              className={clsx(
                "dark:hover:bg-bray-800 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600",
                {
                  "pointer-events-none opacity-50": loading,
                }
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
                {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                  SVG, PNG, JPG or GIF (MAX. 800x400px)
                </p> */}
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept="image/png, image/jpg"
                multiple
                disabled={loading}
                onChange={(e) => {
                  const localFiles = Array.from(e.target.files ?? []);
                  const newFiles = localFiles.map((file) => ({
                    id: uuid(),
                    showId: showId,
                    file,
                  }));
                  addToQueue(newFiles);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <div className="mt-4 h-[250px] overflow-y-auto">
            {queue.filter((i) => i.showId == showId).length == 0 && (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No photos in queue.
                </p>
              </div>
            )}
            {queue
              .filter((i) => i.showId == showId)
              .map((file) => (
                // table of files with file name and trash can icon
                <div
                  className="mt-4 flex items-center justify-between"
                  key={file.id}
                >
                  <div className="flex items-center">
                    <p className="ml-2 select-none">{file.file.name}</p>
                  </div>
                  <div
                    onClick={() => {
                      removeFromQueue(file.id);
                    }}
                    className="cursor-pointer pr-3"
                  >
                    {loading ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                    )}
                  </div>
                </div>
              ))}
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <Button
            className="mx-auto mt-4"
            onClick={() => {
              void triggerUpload();
            }}
            disabled={loading}
          >
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { api } from "@/utils/api";
import { faTrash, faUpload } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../../ui/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/ui/dialog";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { Spinner } from "@/components/ui/ui/spinner";
import imageCompression from "browser-image-compression";

type UploadableFile = {
  name: string;
  type: string;
  size: number;
  file: File;
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
  const [files, setFiles] = useState<UploadableFile[]>([]);
  const [loading, setLoading] = useState(false);
  const generateLink = api.shows.getPresignedUploadLink.useMutation();
  const addPhoto = api.shows.addPhoto.useMutation();

  const upload = async () => {
    setLoading(true);
    for (const newFile of files) {
      const photoId = uuid();
      const link = await generateLink.mutateAsync({
        photoKey: `${photoId}.jpg`,
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
          showId: showId,
          photoId,
          base64: await compressedFile
            .arrayBuffer()
            .then((buffer) => Buffer.from(buffer).toString("base64")),
        });
        setFiles(files.filter((f) => f.name !== newFile.name));
      } catch (err) {
        console.error(err);
      }
    }
    setLoading(false);
  };

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
              className="dark:hover:bg-bray-800 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
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
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setFiles(
                    files.map((file) => ({
                      name: file.name,
                      type: file.type,
                      size: file.size,
                      file: file,
                    }))
                  );
                }}
              />
            </label>
          </div>
          {files.map((file) => (
            // table of files with file name and trash can icon
            <div
              className="mt-4 flex items-center justify-between"
              key={file.name}
            >
              <div className="flex items-center">
                <p className="ml-2">{file.name}</p>
              </div>
              <div
                onClick={() => {
                  setFiles(files.filter((f) => f.name !== file.name));
                }}
                className="cursor-pointer"
              >
                {loading ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                )}
              </div>
            </div>
          ))}
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <Button className="mx-auto mt-4" onClick={upload}>
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

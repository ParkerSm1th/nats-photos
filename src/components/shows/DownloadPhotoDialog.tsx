import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/ui/dialog";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Spinner } from "../ui/ui/spinner";

export const DownloadPhotoDialog = ({
  className,
  open,
  onClose,
  imageUrl,
}: React.HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  onClose: () => void;
  imageUrl: string | null;
}) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(false);
  }, [imageUrl]);
  return !imageUrl ? null : (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className={`sm:max-w-[625px] ${className}`}>
        <DialogHeader>
          <DialogTitle>Download photo</DialogTitle>
        </DialogHeader>
        <div className="relative min-h-[220px] min-w-[330px]">
          <Image
            src={imageUrl}
            alt="Photo"
            layout="responsive"
            width={330}
            height={220}
            objectFit="cover"
            onLoad={() => {
              setLoaded(true);
            }}
          />
          {!loaded ? (
            <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center rounded-lg bg-gray-200 text-gray-600">
              <Spinner />
              Loading Photo
            </div>
          ) : (
            <></>
          )}
        </div>
        <p>
          Once the photo above finishes loading, long press on the image above
          and click "Save to photos"
        </p>
      </DialogContent>
    </Dialog>
  );
};

import { SpinnerPage } from "@/components/global/Spinner";
import { DownloadPhotoDialog } from "@/components/shows/DownloadPhotoDialog";
import { Button } from "@/components/ui/ui/button";
import { Card } from "@/components/ui/ui/card";
import { Spinner } from "@/components/ui/ui/spinner";
import { useToast } from "@/components/ui/ui/use-toast";
import { api } from "@/utils/api";
import { useIsMobile } from "@/utils/hooks/useIsMobile";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";

export default function Purchases() {
  const { isLoading, data } = api.user.getPurchases.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const getRawPhoto = api.user.getRawPhoto.useMutation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [downloadsLoading, setDownloadsLoading] = useState<string[]>([]);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const downloadPhoto = async (photoId: string) => {
    const url = await getRawPhoto.mutateAsync({ photoId });
    if (!url) {
      setDownloadsLoading(downloadsLoading.filter((id) => id !== photoId));
      return toast({
        title: "Error",
        description: "Could not download photo",
      });
    }
    // check user agent
    if (isMobile) {
      setIsDownloadOpen(true);
      setDownloadUrl(url);
    } else {
      window.open(url, "_blank");
    }

    setDownloadsLoading(downloadsLoading.filter((id) => id !== photoId));
  };

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-8 ">
      <div className="text-center">
        <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-black">
          Your purchases
        </h1>
        <p className="text-lg text-muted-foreground">
          You can download the raw photos (no watermark!) below.
        </p>
      </div>
      {isLoading ? (
        <SpinnerPage />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data?.map((purchase) => (
            <Card key={purchase.id} className="bg-slate-50">
              <div className="min-w-[330px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={purchase.image}
                  alt={purchase.photoId}
                  width={330}
                  height={220}
                  className="rounded-t-lg"
                />
              </div>
              <div className="flex flex-col items-center justify-between space-y-2 py-2">
                <div className="text-center">
                  <p className="text-md font-semibold text-black">
                    {purchase.show?.name} ({purchase.show?.location})
                  </p>
                  <p className="text-md text-slate-900">
                    {purchase.show?.startDate.toLocaleDateString() ??
                      purchase.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <Button
                  className="relative bg-purple-600 transition-all hover:bg-purple-700"
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={async () => {
                    setDownloadsLoading([
                      ...downloadsLoading,
                      purchase.photoId,
                    ]);
                    await downloadPhoto(purchase.photoId);
                  }}
                >
                  <span
                    className={clsx({
                      "opacity-0": downloadsLoading.includes(purchase.photoId),
                    })}
                  >
                    Download Raw Photo
                  </span>
                  {downloadsLoading.includes(purchase.photoId) && (
                    <Spinner className="absolute top-1" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <DownloadPhotoDialog
        open={isDownloadOpen}
        onClose={() => {
          setIsDownloadOpen(false);
          setDownloadUrl(null);
        }}
        imageUrl={downloadUrl}
      />
    </div>
  );
}

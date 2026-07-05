import { DownloadPhotoDialog } from "@/components/shows/DownloadPhotoDialog";
import { Button } from "@/components/ui/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/ui/card";
import { Separator } from "@/components/ui/ui/separator";
import { Skeleton } from "@/components/ui/ui/skeleton";
import { Spinner } from "@/components/ui/ui/spinner";
import { useToast } from "@/components/ui/ui/use-toast";
import { api } from "@/utils/api";
import { useIsMobile } from "@/utils/hooks/useIsMobile";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";

function formatPurchaseDate(
  startDate: Date | string | null | undefined,
  fallback: Date | string
) {
  const date = startDate ?? fallback;
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
    try {
      const url = await getRawPhoto.mutateAsync({ photoId });
      if (!url) {
        toast({
          title: "Error",
          description: "Could not download photo",
        });
        return;
      }

      if (isMobile) {
        setIsDownloadOpen(true);
        setDownloadUrl(url);
      } else {
        window.open(url, "_blank");
      }
    } finally {
      setDownloadsLoading((current) =>
        current.filter((id) => id !== photoId)
      );
    }
  };

  const purchases = data ?? [];

  return (
    <div className="container flex-1 space-y-4 p-8 pt-2">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Your purchases
        </h1>
        <p className="text-muted-foreground">
          Download your watermark-free photos below.
        </p>
      </div>

      <Separator className="my-4" />

      {isLoading ? (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="aspect-[3/2] w-full rounded-none" />
              <CardContent className="space-y-2 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-lg font-medium">No purchases yet</p>
          <p className="mt-1 text-muted-foreground">
            Photos you buy will appear here for download.
          </p>
          <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700">
            <Link href="/photos">Browse shows</Link>
          </Button>
        </div>
      ) : (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {purchases.map((purchase) => {
            const isDownloading = downloadsLoading.includes(purchase.photoId);

            return (
              <Card key={purchase.id} className="overflow-hidden">
                <div className="aspect-[3/2] w-full overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={purchase.image}
                    alt={purchase.photoId}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="space-y-1 p-4 text-center">
                  <p className="font-semibold leading-tight">
                    {purchase.show?.name ?? "Unknown show"}
                  </p>
                  {purchase.show?.location && (
                    <p className="text-sm text-muted-foreground">
                      {purchase.show.location}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatPurchaseDate(
                      purchase.show?.startDate,
                      purchase.createdAt
                    )}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    className="relative w-full bg-purple-600 transition-all hover:bg-purple-700"
                    disabled={isDownloading}
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onClick={async () => {
                      setDownloadsLoading((current) => [
                        ...current,
                        purchase.photoId,
                      ]);
                      await downloadPhoto(purchase.photoId);
                    }}
                  >
                    <span className={clsx({ "opacity-0": isDownloading })}>
                      Download raw photo
                    </span>
                    {isDownloading && (
                      <Spinner className="absolute inset-0 m-auto h-5 w-5" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
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

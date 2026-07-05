import { memo, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useCart } from "@/providers/CartProvider";
import { api } from "@/utils/api";
import type { Photo } from "@prisma/client";
import { SpinnerPage } from "../global/Spinner";
import { Spinner } from "../ui/ui/spinner";
import { useAuth } from "@clerk/nextjs";
import { trackEvent } from "@/utils/tracking";
import { Checkbox } from "../ui/ui/checkbox";

const Lightbox = dynamic(() => import("../images/Lightbox"), { ssr: false });

type PhotoResponse = Photo & {
  url: string;
};

const GalleryItem = memo(function GalleryItem({
  photo,
  bulkMode,
  bulkSelections,
  onToggleChecked,
  onSelect,
}: {
  photo: PhotoResponse;
  bulkMode?: boolean;
  bulkSelections?: string[];
  onToggleChecked: (photoId: string) => void;
  onSelect: (photo: PhotoResponse) => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="relative min-h-[150px] min-w-full cursor-pointer"
      onClick={() =>
        bulkMode ? onToggleChecked(photo.id) : onSelect(photo)
      }
    >
      {bulkMode && (
        <Checkbox
          className="absolute left-3 top-3 h-6 w-6 border-purple-300 text-white shadow-md data-[state=checked]:bg-purple-300"
          checked={bulkSelections?.includes(photo.id)}
          onClick={() => {
            onToggleChecked(photo.id);
          }}
        />
      )}
      {/*eslint-disable-next-line @next/next/no-img-element*/}
      <img
        src={photo.url}
        className="rounded-lg"
        alt={photo.id}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
      {!loaded && (
        <div className="absolute left-0 top-0 flex min-h-full min-w-full items-center justify-center rounded-lg bg-gray-200 text-gray-600">
          <Spinner />
        </div>
      )}
    </div>
  );
});

export const PhotoGallery = ({
  id,
  showName,
  adminView,
  bulkMode,
  bulkSelections,
  setBulkSelections,
}: {
  id: string;
  showName: string;
  adminView?: boolean;
  bulkMode?: boolean;
  bulkSelections?: string[];
  setBulkSelections?: (selections: string[]) => void;
}) => {
  const { addToCart } = useCart();
  const { userId } = useAuth();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    isLoading,
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.shows.getShowPhotos.useInfiniteQuery(
    { id, limit: 40 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      retry: 2,
    }
  );

  const photos = data?.pages.flatMap((page) => page.photos) ?? [];

  const utils = api.useContext();

  const deletePhotoMutation = api.shows.deletePhoto.useMutation();
  const invalidateShowPhotosLinksCache =
    api.shows.invalidateShowPhotosLinksCache.useMutation();

  const deletePhoto = async (photoId: string): Promise<void> => {
    await deletePhotoMutation.mutateAsync({
      photoId: photoId,
    });
    await invalidateShowPhotosLinksCache.mutateAsync({ id });
    utils.shows.getShowPhotos.setInfiniteData({ id }, (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          photos: page.photos.filter((item) => item.id !== photoId),
        })),
      };
    });
  };

  const [selectedImage, setSelectedImage] = useState<PhotoResponse | null>(
    null
  );

  useEffect(() => {
    if (!selectedImage) return;
    trackEvent(
      {
        type: "photos.view",
        photoId: selectedImage.id,
        showId: id,
        showName: showName,
      },
      userId
    );
  }, [id, selectedImage, showName, userId]);

  const toggleChecked = useCallback(
    (photoId: string) => {
      const currentBulkSelections = bulkSelections ?? [];
      if (bulkSelections?.includes(photoId)) {
        setBulkSelections?.(
          currentBulkSelections.filter((item) => item !== photoId)
        );
      } else {
        setBulkSelections?.([...currentBulkSelections, photoId]);
      }
    },
    [bulkSelections, setBulkSelections]
  );

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const selectedImageIndex = !photos.length
    ? -1
    : photos.findIndex((item) => item.id === selectedImage?.id);
  const shouldShowNext =
    selectedImageIndex !== -1 &&
    selectedImageIndex < (photos.length ? photos.length - 1 : 0);
  const shouldShowPrev = selectedImageIndex !== -1 && selectedImageIndex > 0;

  return isLoading || !data ? (
    <SpinnerPage />
  ) : (
    <>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <GalleryItem
            key={photo.id}
            photo={photo}
            bulkMode={bulkMode}
            bulkSelections={bulkSelections}
            onToggleChecked={toggleChecked}
            onSelect={setSelectedImage}
          />
        ))}
      </div>
      <div ref={loadMoreRef} className="flex w-full justify-center py-4">
        {isFetchingNextPage && <Spinner />}
      </div>
      {selectedImage && (
        <Lightbox
          selectedImage={selectedImage.url}
          onClose={() => setSelectedImage(null)}
          addCallback={() => {
            addToCart({
              id: selectedImage.id,
              link: selectedImage.url,
              show: { id: id, name: showName },
            });
            trackEvent(
              {
                type: "photos.add-to-cart",
                photoId: selectedImage.id,
                showId: id,
                showName: showName,
              },
              userId
            );
          }}
          deleteCallback={
            adminView
              ? async (photoId: string) => {
                  await deletePhoto(photoId);
                  setSelectedImage(null);
                }
              : undefined
          }
          photoId={selectedImage.id}
          onNext={
            shouldShowNext
              ? () => setSelectedImage(photos[selectedImageIndex + 1] ?? null)
              : undefined
          }
          onPrev={
            shouldShowPrev
              ? () => setSelectedImage(photos[selectedImageIndex - 1] ?? null)
              : undefined
          }
        />
      )}
    </>
  );
};

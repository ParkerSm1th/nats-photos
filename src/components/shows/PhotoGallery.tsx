import Image from "next/image";
import { useState } from "react";
import Lightbox from "../images/Lightbox";
import { useCart } from "@/providers/CartProvider";
import { api } from "@/utils/api";
import { Photo } from "@prisma/client";
import { SpinnerPage } from "../global/Spinner";
import SmallLogo from "../../public/images/WhiteSmallLogo.png";
import { Spinner } from "../ui/ui/spinner";

type PhotoResponse = Photo & {
  url: string;
};

export const PhotoGallery = ({
  id,
  showName,
}: {
  id: string;
  showName: string;
}) => {
  const { addToCart, removeFromCart } = useCart();

  const { isLoading, data } = api.shows.getShowPhotos.useQuery(
    {
      id,
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  const [selectedImage, setSelectedImage] = useState<PhotoResponse | null>(
    null
  );
  const selectedImageIndex = !data
    ? -1
    : data.findIndex((item) => item.id === selectedImage?.id);
  const shouldShowNext =
    selectedImageIndex !== -1 &&
    selectedImageIndex < (data ? data.length - 1 : 0);
  const shouldShowPrev = selectedImageIndex !== -1 && selectedImageIndex > 0;
  const [imagesLoaded, setImagesLoaded] = useState<string[]>([]);
  return isLoading || !data ? (
    <SpinnerPage />
  ) : (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {data.map((photo) => (
          <div
            key={photo.id}
            className="relative min-h-[220px] min-w-[330px] cursor-pointer"
            onClick={() => {
              setSelectedImage(photo);
            }}
          >
            <Image
              src={photo.url}
              layout="responsive"
              width={330}
              height={220}
              objectFit="cover"
              className="rounded-lg"
              alt={photo.id}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRm knyJckliyjqTzSlT54b6bk+h0R//2Q=="
              loading="lazy"
              onLoad={() => {
                setImagesLoaded((prev) => [...prev, photo.id]);
              }}
            />
            {!imagesLoaded.includes(photo.id) ? (
              <div className="absolute left-0 top-0 flex h-[220px] w-[330px] items-center justify-center rounded-lg bg-gray-200 text-gray-600">
                <Spinner />
              </div>
            ) : (
              <></>
            )}
          </div>
        ))}
      </div>
      {selectedImage && (
        <Lightbox
          selectedImage={selectedImage.url}
          onClose={() => setSelectedImage(null)}
          addCallback={() =>
            addToCart({
              id: selectedImage.id,
              link: selectedImage.url,
              show: { id: id, name: showName },
            })
          }
          removeCallback={() => removeFromCart(selectedImage.id)}
          photoId={selectedImage.id}
          onNext={
            shouldShowNext
              ? () => setSelectedImage(data[selectedImageIndex + 1] ?? null)
              : undefined
          }
          onPrev={
            shouldShowPrev
              ? () => setSelectedImage(data[selectedImageIndex - 1] ?? null)
              : undefined
          }
        />
      )}
    </>
  );
};

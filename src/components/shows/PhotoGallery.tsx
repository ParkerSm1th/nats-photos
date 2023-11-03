import Image from "next/image";
import { useState } from "react";
import Lightbox from "../images/Lightbox";
import { useCart } from "@/providers/CartProvider";

type Image = {
  id: string;
  link: string;
};

export const PhotoGallery = ({
  id,
  showName,
}: {
  id: string;
  showName: string;
}) => {
  const { addToCart, removeFromCart } = useCart();

  const data: Image[] = [
    {
      id: "3e8e5253-c63b-4c1d-9daa-d6612ff9f3e7",
      link: "https://res.cloudinary.com/dqdjvho5d/image/upload/v1691816627/2_axc1ll.jpg",
    },
    {
      id: "2",
      link: "https://res.cloudinary.com/dqdjvho5d/image/upload/v1691816629/4_ewj4xy.jpg",
    },
    {
      id: "3",
      link: "https://res.cloudinary.com/dqdjvho5d/image/upload/v1691816627/2_axc1ll.jpg",
    },
    {
      id: "4",
      link: "https://res.cloudinary.com/dqdjvho5d/image/upload/v1691816627/2_axc1ll.jpg",
    },
    {
      id: "5",
      link: "https://res.cloudinary.com/dqdjvho5d/image/upload/v1691816627/2_axc1ll.jpg",
    },
  ];

  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const selectedImageIndex = data.findIndex(
    (item) => item.id === selectedImage?.id
  );
  const shouldShowNext =
    selectedImageIndex !== -1 && selectedImageIndex < data.length - 1;
  const shouldShowPrev = selectedImageIndex !== -1 && selectedImageIndex > 0;
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {data.map((photo) => (
          <div
            key={photo.id}
            className="relative cursor-pointer"
            onClick={() => {
              setSelectedImage(photo);
            }}
          >
            <Image
              src={photo.link}
              layout="responsive"
              width={100}
              height={100}
              objectFit="cover"
              className="rounded-lg"
              alt={photo.id}
            />
          </div>
        ))}
      </div>
      {selectedImage && (
        <Lightbox
          selectedImage={selectedImage.link}
          onClose={() => setSelectedImage(null)}
          addCallback={() =>
            addToCart({
              id: selectedImage.id,
              link: selectedImage.link,
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

import { faArrowLeft, faArrowRight } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useEffect } from "react";
import { Icons } from "../ui/ui/icons";

function Lightbox({
  selectedImage,
  onClose,
  onNext,
  onPrev,
}: {
  selectedImage: string;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext) onNext();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, onNext, onPrev]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span
          className="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div
          className="m-8 inline-block max-w-screen-lg transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:align-middle"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div className="relative">
            <button
              type="button"
              className="absolute right-0 top-0 m-4 text-white"
              onClick={onClose}
            >
              <Icons.cross className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            {!!onPrev && (
              <button
                type="button"
                className="absolute left-0 top-1/2 m-4 -translate-y-1/2 text-white"
                onClick={onPrev}
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  style={{
                    height: "1.75rem",
                  }}
                />
                <span className="sr-only">Previous</span>
              </button>
            )}
            {!!onNext && (
              <button
                type="button"
                className="absolute right-0 top-1/2 m-4 -translate-y-1/2 text-white"
                onClick={onNext}
              >
                <FontAwesomeIcon
                  icon={faArrowRight}
                  style={{
                    height: "1.75rem",
                  }}
                />
                <span className="sr-only">Next</span>
              </button>
            )}
            <Image
              src={selectedImage}
              alt="selected image"
              width={800}
              height={800}
              className="h-full w-full"
              layout="responsive"
              placeholder="blur"
              objectFit="contain"
              loading="lazy"
              blurDataURL={selectedImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Lightbox;

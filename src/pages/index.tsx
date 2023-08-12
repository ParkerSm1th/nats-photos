import { RootLayout } from "@/components/global/Layout";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import Lightbox from "@/components/images/Lightbox";
import { useIsMobile } from "@/utils/hooks/useIsMobile";
import { useState, type ReactElement } from "react";
import SmallLogo from "../../public/images/WhiteSmallLogo.png";

const NAV_LINKS = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/about",
    label: "About",
  },
  {
    href: "/portfolio",
    label: "Portfolio",
  },
  {
    href: "/photos",
    label: "Get Your Photos",
  },
  {
    href: "/contact",
    label: "Contact",
  },
];

function MobileNav() {
  return (
    <div className="flex flex-row items-center justify-center gap-4">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="z-10 text-lg font-medium text-white"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

function Nav() {
  return (
    <div className="relative mt-2 flex h-full flex-col items-center md:mt-4">
      <div className="align-center mb-4 flex flex-row justify-end gap-2">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="px-4 py-2 font-medium text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <Link href="/">
        <Image
          src={SmallLogo}
          className="z-0 h-16 w-16 select-none md:h-24 md:w-24"
          alt="natalie lockhart logo"
        />
      </Link>
    </div>
  );
}

function Home() {
  const isMobile = useIsMobile();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const portfolioItems = [
    {
      title: "Maggie & Ravello",
      showName: "Estes Park, 2023",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1691816627/2_axc1ll.jpg",
    },
    {
      title: "Leslie & Jax",
      showName: "Estes Park, 2023",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1691816627/1_gk0cqr.jpg",
    },
    {
      title: "Marti & Panda Pop",
      showName: "Estes Park, 2023",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1691816628/3_cwkwyv.jpg",
    },
    {
      title: "Megan & Hobbs",
      showName: "Estes Park, 2023",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1691816628/5_h4lqqi.jpg",
    },
    {
      title: "Presley & Arizona",
      showName: "Estes Park, 2023",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1691816629/4_ewj4xy.jpg",
    },
  ];

  const selectedImageIndex = portfolioItems.findIndex(
    (item) => item.image === selectedImage
  );

  const shouldShowNext =
    selectedImageIndex !== -1 && selectedImageIndex < portfolioItems.length - 1;
  const shouldShowPrev = selectedImageIndex !== -1 && selectedImageIndex > 0;

  return (
    <>
      <Head>
        <title>Natalie Lockhart Photography</title>
      </Head>
      <main className="min-w-screen home mb-28 flex min-h-screen flex-col items-center justify-center bg-white">
        <div className="hero-bg h-screen max-h-screen w-full overflow-hidden">
          {isMobile ? <MobileNav /> : <Nav />}
        </div>
        <div className="w-full max-w-7xl px-8">
          <div className="m-auto mt-16 flex w-full max-w-3xl flex-col items-center justify-center">
            <h1 className="text-center text-3xl font-medium">
              Equine Photography
            </h1>
            <p className="pt-8 text-center">
              My name is Giana Terranova, and I’m a traveling equestrian
              photographer based out of many locations throughout the United
              States. I aim to represent the beauty and grace of our equine
              partners through portraiture, as well as capturing the bond
              between horse and rider. As an equestrian myself, I've always held
              horses in a very special part of my heart, combining my equine
              knowledge and the art of photography to create lasting imagery and
              memories.
            </p>
            <p className="pt-4 text-center font-bold">
              Currently based in Fort Collins, CO
            </p>
          </div>
          <div className="mt-12 flex w-full flex-col items-center justify-center gap-4">
            <h2 className="mb-2 text-2xl font-bold">Some of my work</h2>
            <div className="grid w-full grid-cols-3 gap-4">
              {portfolioItems.map((item) => (
                <div
                  key={item.showName}
                  className="group flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md"
                  onClick={() => setSelectedImage(item.image)}
                >
                  {/* Hide the meta data and show it centered in the middle of the image on hover of the whole div */}
                  <div className="absolute z-10 flex select-none flex-col items-center justify-center text-white opacity-0 transition-all group-hover:opacity-100">
                    <h3 className="text-sm font-bold md:text-xl">
                      {item.title}
                    </h3>
                    <h4 className="mt-1 text-xs md:text-lg">{item.showName}</h4>
                  </div>
                  <Image
                    height={200}
                    width={200}
                    className="z-0 h-full w-full select-none transition-all group-hover:brightness-50 group-hover:filter"
                    src={item.image}
                    alt="portfolio item"
                    quality={100}
                    loading="eager"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-bg mt-16 h-screen max-h-screen w-full overflow-hidden"></div>
      </main>

      {selectedImage && (
        <Lightbox
          selectedImage={selectedImage}
          onClose={() => setSelectedImage("")}
          onNext={
            shouldShowNext
              ? () =>
                  setSelectedImage(
                    portfolioItems[selectedImageIndex + 1]?.image ?? ""
                  )
              : undefined
          }
          onPrev={
            shouldShowPrev
              ? () =>
                  setSelectedImage(
                    portfolioItems[selectedImageIndex - 1]?.image ?? ""
                  )
              : undefined
          }
        />
      )}
    </>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <RootLayout>{page}</RootLayout>;
};

export default Home;

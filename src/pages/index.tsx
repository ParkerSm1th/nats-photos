import { RootLayout } from "@/components/global/Layout";
import Lightbox from "@/components/images/Lightbox";
import { useIsMobile } from "@/utils/hooks/useIsMobile";
import { faArrowDown } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import type { ReactElement } from "react";
import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
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
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <>
      <Head>
        <title>Natalie Lockhart Photography</title>
      </Head>
      <main className="min-w-screen home mb-28 flex min-h-screen flex-col items-center justify-center bg-white">
        <div className="hero-bg h-screen max-h-screen w-full overflow-hidden">
          {isMobile ? <MobileNav /> : <Nav />}
          <div
            className="absolute bottom-10 left-1/2 h-6 w-6 translate-x-1/2 cursor-pointer text-lg text-white"
            onClick={() => {
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
            }}
          >
            <FontAwesomeIcon icon={faArrowDown} />
          </div>
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
        <div className="mt-16 w-full overflow-hidden">
          <Image
            src="https://res.cloudinary.com/dqdjvho5d/image/upload/v1692488716/IMG_6221_copy_gwrllk.jpg"
            quality={100}
            height={400}
            width={1000}
            loading="eager"
            alt="Equine photography"
            className="h-full w-screen object-cover"
          />
        </div>
        <div className="my-16">
          <h2 className="mb-2 text-center text-2xl font-bold">
            Let's work together!
          </h2>
          <div className="grid max-w-4xl grid-cols-2 items-center justify-center gap-2">
            <div className="text-center">
              <h2 className="mb-2 text-center text-2xl font-semibold">
                Scheduled Locations
              </h2>
              <p className="text-md px-2">
                Below you can find the shows I am already scheduled to be
                shooting at. If you are attending one of the below shows please
                reach out letting me know you'd like for me to shoot you at that
                show!
              </p>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                bookedDays={[
                  {
                    date: new Date(2023, 8, 1),
                    title: "Estes Park, 2023",
                  },
                ]}
              />
            </div>
            <div className="text-center">
              <h2 className="mb-2 text-center text-2xl font-semibold">
                Other Inquiries
              </h2>
              <p className="text-md px-2">
                If you are interested in booking a session with me or I am not
                already scheduled to attend a show you will be showing at,
                please reach out and let's see if we can make something happen!
              </p>
            </div>
          </div>
        </div>
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

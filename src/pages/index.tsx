import { RootLayout } from "@/components/global/Layout";
import Lightbox from "@/components/images/Lightbox";
import { useIsMobile } from "@/utils/hooks/useIsMobile";
import { faArrowDown } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { api } from "@/utils/api";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faBars, faXmark } from "@fortawesome/pro-solid-svg-icons";
import { AnimatePresence, motion } from "framer-motion";
import SmallLogo from "../../public/images/WhiteSmallLogo.png";

import Presley from "../../public/images/home/private/presley.jpg";
import { faEnvelope } from "@fortawesome/pro-regular-svg-icons";

const NAV_LINKS = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/#about",
    label: "About",
  },
  {
    href: "/#portfolio",
    label: "Portfolio",
  },
  {
    href: "/photos",
    label: "Get Your Photos",
  },
  {
    href: "/#private",
    label: "Private Sessions",
  },
  {
    href: "/#contact",
    label: "Contact",
  },
];

function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <AnimatePresence>
      <div className="relative mx-4 mt-4 flex flex-row items-center justify-between">
        <Image src={SmallLogo} className="h-12 w-12 select-none" alt="logo" />
        {!isMenuOpen && (
          <div
            className="h-6 w-6 text-white"
            onClick={() => setIsMenuOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} />
          </div>
        )}
      </div>
      {isMenuOpen && (
        <motion.div
          className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center bg-black bg-opacity-90"
          key="menu"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute right-4 top-8 h-6 w-6 text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faXmark} />
          </div>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              scroll
              className="px-4 py-2 font-medium text-white"
            >
              {link.label}
            </Link>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
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
            scroll
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
      title: "Marti & Panda Pop",
      showName: "Estes Park, 2023",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1691816628/3_cwkwyv.jpg",
    },
    {
      title: "Blondie",
      showName: "Parker, 2024",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1725298215/WhatsApp_Image_2024-08-20_at_19.19.08_xgk1ft.jpg",
    },
    {
      title: "Megan & Tiny",
      showName: "Estes Park, 2024",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1725298940/DSC04702-min_ezxdeo.jpg",
    },
    {
      title: "Iris & Deacon",
      showName: "Parker, 2024",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1725298215/WhatsApp_Image_2024-08-20_at_19.24.04_tgsrsc.jpg",
    },
    {
      title: "Presley & Gator",
      showName: "Parker, 2024",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1725298215/WhatsApp_Image_2024-08-20_at_19.30.32_grpmev.jpg",
    },
    {
      title: "Avi",
      showName: "Parker, 2024",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1725298215/WhatsApp_Image_2024-08-20_at_19.25.19_vjhcuo.jpg",
    },
    {
      title: "Iris & Tiny",
      showName: "Parker, 2024",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1725298213/WhatsApp_Image_2024-08-20_at_19.30.46_awvrcq.jpg",
    },
    {
      title: "Iris & Deacon",
      showName: "Parker, 2024",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1725298213/WhatsApp_Image_2024-08-20_at_19.35.25_tdabre.jpg",
    },
    {
      title: "Laila & Chester",
      showName: "Parker, 2024",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1725298213/WhatsApp_Image_2024-08-20_at_19.30.41_giooyf.jpg",
    },
    {
      title: "Rory, Presley, Hadley & Panda",
      showName: "Estes Park, 2024",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1725298213/WhatsApp_Image_2024-08-20_at_19.44.44_yjptw0.jpg",
    },
    {
      title: "Iris & Deacon",
      showName: "Estes Park, 2024",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1725298213/WhatsApp_Image_2024-08-20_at_19.45.57_slv0o5.jpg",
    },
    {
      title: "Nora, Maggie, & Sir",
      showName: "Estes Park, 2024",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1725298213/WhatsApp_Image_2024-08-20_at_19.53.08_ibwqkf.jpg",
    },
    {
      title: "Ellie",
      showName: "Parker, 2024",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1725298213/WhatsApp_Image_2024-08-20_at_19.46.24_h2kasf.jpg",
    },
    {
      title: "Presley & Gator",
      showName: "Parker, 2024",
      image:
        "https://res.cloudinary.com/dqdjvho5d/image/upload/v1725299287/IMG_8602-min_gzvfiy.jpg",
    },
  ];

  const selectedImageIndex = portfolioItems.findIndex(
    (item) => item.image === selectedImage
  );

  const shouldShowNext =
    selectedImageIndex !== -1 && selectedImageIndex < portfolioItems.length - 1;
  const shouldShowPrev = selectedImageIndex !== -1 && selectedImageIndex > 0;
  const [date, setDate] = useState<Date>(new Date());

  const [expanded, setExpanded] = useState(false);

  const itemsToShow = expanded ? portfolioItems : portfolioItems.slice(0, 6);

  const { data, isLoading } = api.shows.showSchedule.useQuery();

  useEffect(() => {
    if (data) {
      console.log(data);
    }
  }, [data]);

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
        <div className="w-full max-w-7xl px-8" id="about">
          <div className="m-auto mt-16 flex w-full max-w-3xl flex-col items-center justify-center">
            <h1 className="text-center text-3xl font-medium">
              Equine Photography
            </h1>
            <p className="pt-8 text-center">
              Hi! My name is Natalie Lockhart, I am a photographer based in Fort
              Collins. As a photographer I aim to capture the bond between the
              horse and rider. Those moments during shows, lessons, and time
              spent together are the most important. Creating these special
              images that can last for a lifetime are memorable for everyone to
              enjoy. Whether it is portraits, action shots, or heartfelt
              moments, pictures will help keep the memory of horse riding alive.
            </p>
            <p className="pt-4 text-center font-bold">
              Currently based in Fort Collins, CO
            </p>
          </div>
          <div
            className="flex w-full flex-col items-center justify-center gap-4 pt-12"
            id="portfolio"
          >
            <h2 className="mb-2 text-2xl font-bold">Some of my work</h2>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
              {itemsToShow.map((item) => (
                <div
                  key={item.image}
                  className="group flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md"
                  onClick={() => setSelectedImage(item.image)}
                >
                  {/* Hide the meta data and show it centered in the middle of the image on hover of the whole div */}
                  <div className="absolute z-10 flex select-none flex-col items-center justify-center text-white opacity-0 transition-all group-hover:opacity-100">
                    <h3 className="sm:text-md text-lg font-bold md:text-xl">
                      {item.title}
                    </h3>
                    <h4 className="text-md mt-1 sm:text-sm md:text-lg">
                      {item.showName}
                    </h4>
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
            <div className="flex justify-center">
              <button
                className="mt-4 rounded-md bg-purple-500 px-4 py-2 font-medium text-white"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show Less" : "Show More"}
              </button>
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
        <div
          className="mb-10 flex w-full flex-col items-center justify-center gap-4 px-8 pt-12 lg:px-0"
          id="private"
        >
          <h2 className="mb-12 text-center text-2xl font-bold">
            Private Sessions
          </h2>
          <div className="flex flex-col items-center justify-center gap-8 md:flex-row">
            <div className="flex max-w-md flex-col items-center justify-center gap-12">
              <div className="flex flex-row items-center justify-center gap-4">
                <Image
                  src={Presley}
                  alt="Presley & Gator"
                  className="max-h-44 w-auto md:max-h-64"
                />
                <Image
                  src={'https://res.cloudinary.com/dqdjvho5d/image/upload/v1725302003/ellie_u2zmtz.jpg'}
                  alt="Ellie"
                  width={200}
                  height={200}
                  className="max-h-44 w-auto md:max-h-64"
                />
              </div>
              <div className="flex max-w-md flex-col items-center justify-center gap-2">
                <h2 className="text-center text-2xl">Private Session</h2>
                <p className="text-center">
                  Private sessions are based at <strong>$200</strong> for an
                  1hr-1.5hr long shoot. With this package, you get 5 free
                  pictures, outfit changes, and no extra pet fee if you choose
                  to bring a furry friend. All other pictures that you want to
                  purchase will be $5.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-8">
              <div className="flex max-w-md flex-col items-center justify-center gap-2">
                <h2 className="text-center text-2xl">3 Buddy Session</h2>
                <p className="text-center">
                  Grab 3 friends and plan a date! This session is based at a
                  price of <strong>$400</strong>. This session will be a 2hr
                  session and will include one outfit change and 5 free pictures
                  for each person. All other pictures that you or your party
                  will want to purchase will be $5.
                </p>
              </div>
              <div className="flex max-w-md flex-col items-center justify-center gap-2">
                <div className="flex flex-col items-center">
                  <h2 className="text-center text-2xl">Barn Package</h2>
                  <span className="text-sm font-bold text-purple-400">
                    Best Deal!
                  </span>
                </div>
                <p className="text-center">
                  Wrangle your barn buddies and horses! Included in this package
                  deal is 5 or more people & horses, one outfit change, and five
                  free pictures per person. This package starts at{" "}
                  <strong>$500</strong> and will be located at your residing
                  barn! It will be an 1hr-1.5hr per person, so prepare
                  accordingly!
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="my-16 flex flex-col gap-4" id="contact">
          <h2 className="text-center text-2xl font-bold">
            Let's work together!
          </h2>
          <div className="flex md:flex-row flex-col items-center justify-center gap-4 text-center">
            <a
              href="https://www.instagram.com/natalie_lockhart_photos/"
              target="_blank"
              className="w-[300px]"
            >
              <div className="m-auto mt-2 flex w-fit flex-row items-center justify-between align-middle">
                <div className="rounded-md bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-0.5">
                  <FontAwesomeIcon
                    icon={faInstagram}
                    className="h-6 w-6 text-white"
                  />
                </div>
                <p className="text-md px-2 font-medium">
                  @natalie_lockhart_photos
                </p>
              </div>
            </a>
            <a
              href="mailto:natalielockhartphotos@gmail.com"
              target="_blank"
              className="w-[300px]"
            >
              <div className="m-auto mt-2 flex w-fit flex-row items-center justify-between align-middle">
                <div className="p-0.5">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="h-6 w-6 text-black"
                  />
                </div>
                <p className="text-md px-2 font-medium">
                  natalielockhartphotos@gmail.com
                </p>
              </div>
            </a>
          </div>
          <div>
            <div className="mx-4 mt-4 flex max-w-4xl flex-col-reverse items-center justify-center gap-8 md:mx-0 md:flex-row md:items-start md:gap-4">
              <div className="text-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => {
                    if (!date) return;
                    setDate(date);
                  }}
                  className="rounded-md border"
                  bookedDays={
                    isLoading || !data
                      ? []
                      : data?.map((show) => ({
                          date: new Date(show.date),
                          title: show.name,
                          location: show.location,
                        }))
                  }
                />
              </div>
              <div className="max-w-sm text-center">
                <p className="text-md px-2">
                  These are the shows that I am already scheduled to attend, you
                  can reach out to sign up to have your photos taken at these
                  shows! I also offer private shoots at your barn, please reach
                  out to me for more information on that or any other shows
                  you'd like me to attend!
                </p>
              </div>
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

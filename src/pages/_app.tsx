import { DashboardLayout } from "@/components/global/Layout";
import { api } from "@/utils/api";

import "@/styles/globals.css";

import { Toaster } from "@/components/ui/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import type { NextPage } from "next";
import { Session } from "next-auth";
import type { AppType } from "next/app";
import Head from "next/head";
import { CartProvider } from "@/providers/CartProvider";

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactElement;
};

const MainApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const getLayout =
    (Component as NextPageWithLayout).getLayout ??
    ((page) => <DashboardLayout>{page}</DashboardLayout>);
  return (
    <>
      <Head>
        <meta name="description" content="Natalie Lockhart's Photography" />
        <title>Natalie Lockhart Photography</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/images/favicon/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        ></link>
      </Head>
      <ClerkProvider>
        <CartProvider>{getLayout(<Component {...pageProps} />)}</CartProvider>
      </ClerkProvider>
      <Toaster />
    </>
  );
};

export default api.withTRPC(MainApp);

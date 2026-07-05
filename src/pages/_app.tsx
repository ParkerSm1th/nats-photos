import { DashboardLayout } from "@/components/global/Layout";
import { Toaster } from "@/components/ui/ui/toaster";
import { getClerkProviderProps } from "@/lib/clerk-config";
import { api } from "@/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { Raleway } from "next/font/google";

import "@/styles/globals.css";

import type { NextPage } from "next";
import type { Session } from "next-auth";
import type { AppType } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { CartProvider } from "@/providers/CartProvider";
import { UploadsProvider } from "@/providers/UploadsProvider";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactElement;
};

function AppProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith("/photos/admin");

  if (isAdminRoute) {
    return <UploadsProvider>{children}</UploadsProvider>;
  }

  return <>{children}</>;
}

const MainApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { ...pageProps },
}) => {
  const getLayout =
    (Component as NextPageWithLayout).getLayout ??
    ((page) => <DashboardLayout>{page}</DashboardLayout>);
  return (
    <div className={raleway.className}>
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
      </Head>
      <ClerkProvider {...getClerkProviderProps()}>
        <Analytics />
        <CartProvider>
          <AppProviders>{getLayout(<Component {...pageProps} />)}</AppProviders>
        </CartProvider>
      </ClerkProvider>
      <Toaster />
    </div>
  );
};

export default api.withTRPC(MainApp);

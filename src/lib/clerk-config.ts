import { PRODUCTION_SITE_URL, isPreviewDeployment } from "@/lib/app-url";

const DEV_CLERK_ACCOUNTS_URL = "https://big-sloth-75.accounts.dev/user";
const PROD_CLERK_ACCOUNTS_URL =
  "https://accounts.natalielockhartphotos.com/user";
const PRODUCTION_CLERK_DOMAIN = "natalielockhartphotos.com";

const VERCEL_PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;

export function usesProductionClerkKeys() {
  return (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_live_") ??
    false
  );
}

export function getClerkAccountsUrl() {
  return usesProductionClerkKeys()
    ? PROD_CLERK_ACCOUNTS_URL
    : DEV_CLERK_ACCOUNTS_URL;
}

function getSatelliteClerkProps(domain: string) {
  return {
    isSatellite: true as const,
    domain,
    signInUrl: `${PRODUCTION_SITE_URL}/sign-in`,
    signUpUrl: `${PRODUCTION_SITE_URL}/sign-up`,
  };
}

export function getClerkProviderProps() {
  const allowedRedirectOrigins: (string | RegExp)[] = [
    "http://localhost:3000",
    PRODUCTION_SITE_URL,
    "https://www.natalielockhartphotos.com",
    VERCEL_PREVIEW_ORIGIN,
  ];

  if (usesProductionClerkKeys()) {
    if (isPreviewDeployment()) {
      const previewDomain =
        process.env.NEXT_PUBLIC_CLERK_PREVIEW_DOMAIN ?? process.env.VERCEL_URL;

      if (previewDomain) {
        return {
          ...getSatelliteClerkProps(previewDomain),
          allowedRedirectOrigins,
        };
      }
    }

    return {
      ...getSatelliteClerkProps(PRODUCTION_CLERK_DOMAIN),
      allowedRedirectOrigins,
    };
  }

  return { isSatellite: false as const, allowedRedirectOrigins };
}

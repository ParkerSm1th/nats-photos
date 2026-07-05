import { PRODUCTION_SITE_URL, isPreviewDeployment } from "@/lib/app-url";

const DEV_CLERK_ACCOUNTS_URL = "https://big-sloth-75.accounts.dev/user";
const PROD_CLERK_ACCOUNTS_URL =
  "https://accounts.natalielockhartphotos.com/user";

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

export function getClerkProviderProps() {
  const allowedRedirectOrigins: (string | RegExp)[] = [
    "http://localhost:3000",
    PRODUCTION_SITE_URL,
    VERCEL_PREVIEW_ORIGIN,
  ];

  const previewDomain =
    process.env.NEXT_PUBLIC_CLERK_DOMAIN ?? process.env.VERCEL_URL;

  if (isPreviewDeployment() && usesProductionClerkKeys() && previewDomain) {
    return {
      isSatellite: true,
      domain: previewDomain,
      signInUrl: `${PRODUCTION_SITE_URL}/sign-in`,
      signUpUrl: `${PRODUCTION_SITE_URL}/sign-up`,
      allowedRedirectOrigins,
    };
  }

  return { allowedRedirectOrigins };
}

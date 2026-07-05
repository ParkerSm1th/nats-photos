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

function getPreviewSatelliteDomain() {
  return process.env.NEXT_PUBLIC_CLERK_PREVIEW_DOMAIN ?? process.env.VERCEL_URL;
}

function getPreviewSatelliteProps() {
  const previewDomain = getPreviewSatelliteDomain();

  if (!previewDomain) {
    return null;
  }

  return {
    isSatellite: true as const,
    domain: previewDomain,
    signInUrl: `${PRODUCTION_SITE_URL}/sign-in`,
    signUpUrl: `${PRODUCTION_SITE_URL}/sign-up`,
  };
}

function getAllowedRedirectOrigins() {
  return [
    "http://localhost:3000",
    PRODUCTION_SITE_URL,
    "https://www.natalielockhartphotos.com",
    VERCEL_PREVIEW_ORIGIN,
  ];
}

export function shouldUsePreviewSatelliteMode() {
  return (
    usesProductionClerkKeys() &&
    isPreviewDeployment() &&
    Boolean(getPreviewSatelliteDomain())
  );
}

export function getClerkMiddlewareOptions() {
  if (!shouldUsePreviewSatelliteMode()) {
    return {};
  }

  return getPreviewSatelliteProps() ?? {};
}

export function getClerkProviderProps() {
  const allowedRedirectOrigins = getAllowedRedirectOrigins();

  if (shouldUsePreviewSatelliteMode()) {
    return {
      ...getPreviewSatelliteProps(),
      allowedRedirectOrigins,
    };
  }

  return { allowedRedirectOrigins };
}

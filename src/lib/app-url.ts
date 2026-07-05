export const PRODUCTION_SITE_URL = "https://natalielockhartphotos.com";

export function isPreviewDeployment() {
  return (
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "preview"
  );
}

export function getAppUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (isPreviewDeployment() && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NODE_ENV === "development") {
    return `http://localhost:${process.env.PORT ?? 3000}`;
  }

  if (process.env.NEXT_PUBLIC_ORIGIN) {
    return process.env.NEXT_PUBLIC_ORIGIN;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return PRODUCTION_SITE_URL;
}

import { getAuth, withClerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { HOSTNAME, isAdmin as isUserAdmin } from "./lib/utils";

function getPublicMetadataFromClaims(
  sessionClaims: Record<string, unknown> | null | undefined
): UserPublicMetadata | undefined {
  if (!sessionClaims) return undefined;
  const claims = sessionClaims as {
    publicMetadata?: UserPublicMetadata;
    metadata?: UserPublicMetadata;
  };
  return claims.publicMetadata ?? claims.metadata;
}

const publicPaths = [
  "/",
  "/sign-in*",
  "/signup*",
  "/api/trpc/shows*",
  "/api/stripe/webhook",
  "/en/api/stripe/webhook",
  "/photos/shows*",
  "/photos/cart",
  "/photos",
];

const adminPaths = ["/photos/admin*"];

const isPublic = (path: string) => {
  return publicPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", "($|/|\\.)")))
  );
};

const isAdmin = (path: string) => {
  return adminPaths.find((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", "($|/|\\.)")))
  );
};

export default withClerkMiddleware((request: NextRequest) => {
  const { userId } = getAuth(request);

  if (isPublic(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  // if the user is not signed in redirect them to the sign in page.

  if (!userId) {
    // redirect the users to /pages/sign-in/[[...index]].ts
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  if (isAdmin(request.nextUrl.pathname)) {
    const metadata = getPublicMetadataFromClaims(
      getAuth(request).sessionClaims as Record<string, unknown> | null
    );
    if (!metadata || !isUserAdmin(metadata)) {
      return NextResponse.redirect(`${HOSTNAME()}/photos`);
    }
  }
  return NextResponse.next();
});

// Stop Middleware running on static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next
     * - static (static files)
     * - favicon.ico (favicon file)
     */
    "/(.*?trpc.*?|(?!static|.*\\..*|_next|favicon.ico).*)",
    "/",
  ],
};

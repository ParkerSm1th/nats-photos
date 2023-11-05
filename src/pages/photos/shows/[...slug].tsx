import { SpinnerPage } from "@/components/global/Spinner";
import { DynamicShowNameBreadcrumb } from "@/components/shows/DynamicShowNameBreadcrumb";
import { PhotoGallery } from "@/components/shows/PhotoGallery";
import { Spinner } from "@/components/ui/ui/spinner";
import { api } from "@/utils/api";
import { trackEvent } from "@/utils/tracking";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Show() {
  const router = useRouter();
  const { userId } = useAuth();
  const slugs = router.query.slug as string[];
  const furthestRightSlug = slugs ? slugs[slugs.length - 1] : null;
  const show = api.shows.getShowBySlug.useQuery(
    {
      slug: furthestRightSlug!,
    },
    {
      enabled: !!furthestRightSlug,
    }
  );
  const showName = api.shows.getShowNameBySlug.useQuery(
    {
      slug: furthestRightSlug!,
    },
    {
      enabled: !!furthestRightSlug,
    }
  );

  return showName.isLoading ? (
    <Spinner />
  ) : (
    <>
      <main className="flex flex-col items-center justify-center">
        <DynamicShowNameBreadcrumb slugs={slugs} />
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-8 ">
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-black">
              {showName.data}
            </h1>
            <p className="text-lg text-muted-foreground">
              You can click on a photo to preview it and add it to your cart.
              <br />
              Once you purchase a photo you will receive the photo at{" "}
              <span className="font-semibold">full resolution</span> with{" "}
              <span className="font-semibold">no watermark</span>.
            </p>
          </div>
          {show.isLoading || !show.data ? (
            <SpinnerPage />
          ) : (
            <>
              <div className="flex flex-row items-center gap-2">
                <>
                  {show.data?.children && (
                    <div className="flex flex-row items-center gap-2">
                      {show.data?.children.map((child) => (
                        <div key={child.id}>
                          <Link
                            className="text-black underline"
                            href={`/photos/shows/${slugs.join("/")}/${
                              child.slug
                            }`}
                          >
                            {child.name}
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              </div>
              <PhotoGallery id={show.data?.id} showName={show.data.name} />
            </>
          )}
        </div>
      </main>
    </>
  );
}

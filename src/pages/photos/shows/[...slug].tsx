import { SpinnerPage } from "@/components/global/Spinner";
import { DynamicShowNameBreadcrumb } from "@/components/shows/DynamicShowNameBreadcrumb";
import { PhotoGallery } from "@/components/shows/PhotoGallery";
import { Spinner } from "@/components/ui/ui/spinner";
import { api } from "@/utils/api";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Show() {
  const router = useRouter();
  const slugs = router.query.slug as string[];
  if (!slugs) return null;
  const furthestRightSlug = slugs[slugs.length - 1];
  if (!furthestRightSlug) return null;
  const showName = api.shows.getShowNameBySlug.useQuery({
    slug: furthestRightSlug,
  });

  const show = api.shows.getShowBySlug.useQuery({
    slug: furthestRightSlug,
  });

  return showName.isLoading ? (
    <Spinner />
  ) : (
    <>
      <main className="flex flex-col items-center justify-center">
        <DynamicShowNameBreadcrumb slugs={slugs} />
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-8 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-black">
            {showName.data}
          </h1>
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

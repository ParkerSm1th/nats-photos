import { DynamicShowNameBreadcrumb } from "@/components/shows/DynamicShowNameBreadcrumb";
import { api } from "@/utils/api";
import { useRouter } from "next/router";

export default function Show() {
  const router = useRouter();
  const slugs = router.query.slug as string[];
  if (!slugs) return null;
  const furthestRightSlug = slugs[slugs.length - 1];
  if (!furthestRightSlug) return null;
  const show = api.shows.getShowBySlug.useQuery({
    slug: furthestRightSlug,
  });

  return show.isLoading ? (
    <div>Loading...</div>
  ) : !show.data ? (
    <div>Error</div>
  ) : (
    <>
      <main className="flex flex-col items-center justify-center">
        <DynamicShowNameBreadcrumb slugs={slugs} />
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-8 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-black">
            {show.data?.name}
          </h1>
          {show.data?.children && (
            <div className="flex flex-row items-center gap-2">
              {show.data?.children.map((child) => (
                <div key={child.id}>
                  <a
                    className="text-black underline"
                    href={`/photos/shows/${slugs.join("/")}/${child.slug}`}
                  >
                    {child.name}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

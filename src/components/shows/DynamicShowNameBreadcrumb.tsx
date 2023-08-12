import { api } from "@/utils/api";
import { useMemo } from "react";
import { Spinner } from "../ui/ui/spinner";

export const DynamicShowNameBreadcrumb = ({
  slugs,
}: {
  slugs: string[];
}): JSX.Element | null => {
  const allSlugs = ["photos", "shows", ...slugs];
  const { data: showData, isLoading } =
    api.shows.getShowsBySlug.useQuery(slugs);
  // organize the show data so that it's in the same order as the slugs
  const sortedShows = showData?.sort((a, b) => {
    return slugs.indexOf(a.slug) - slugs.indexOf(b.slug);
  });
  const organizedShowData = useMemo(
    () => [
      {
        id: "photos",
        name: "Photos",
        slug: "photos",
      },
      {
        id: "shows",
        name: "Shows",
        slug: "shows",
      },
      ...(sortedShows
        ? sortedShows.map((show) => ({
            id: show.id,
            name: show.name,
            slug: show.slug,
          }))
        : []),
    ],
    [sortedShows]
  );
  return isLoading ? (
    <Spinner className="h-6 w-6" />
  ) : (
    <div className="sm:display-none flex flex-row items-center gap-2">
      {organizedShowData?.map((show, index) => (
        <div key={show.id}>
          <a
            className="text-black underline"
            // we want the href to be the slug of the show, and all the slugs before it
            // so if we have /shows/2021/summer-classic, the array will be ["shows", "2021", "summer-classic"]
            // then we want to display a breadcrumb like this:
            href={`/${allSlugs
              .slice(0, allSlugs.indexOf(show.slug) + 1)
              .join("/")}`}
          >
            {show.name}
          </a>
          {index !== organizedShowData.length - 1 && " > "}
        </div>
      ))}
    </div>
  );
};

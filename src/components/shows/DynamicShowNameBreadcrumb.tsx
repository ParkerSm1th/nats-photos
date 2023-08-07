import { api } from "@/utils/api";

export const DynamicShowNameBreadcrumb = ({
  slugs,
}: {
  slugs: string[];
}): JSX.Element | null => {
  const allSlugs = ["photos", "shows", ...slugs];
  const showData = api.shows.getShowsBySlug.useQuery(slugs);
  // organize the show data so that it's in the same order as the slugs
  const sortedShows = showData.data?.sort((a, b) => {
    return slugs.indexOf(a.slug) - slugs.indexOf(b.slug);
  });
  if (!sortedShows) return null;
  const organizedShowData = [
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
    ...sortedShows.map((show) => ({
      id: show.id,
      name: show.name,
      slug: show.slug,
    })),
  ];
  return (
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

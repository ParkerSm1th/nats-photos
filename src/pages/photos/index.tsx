import { Show } from "@/common/types";
import { SpinnerPage } from "@/components/global/Spinner";
import { Card, CardContent, CardHeader } from "@/components/ui/ui/card";
import { api } from "@/utils/api";
import Link from "next/link";

export default function PhotosHome() {
  const shows = api.shows.getAll.useQuery(
    {
      orderByStartDate: "desc",
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );
  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-8 ">
      <div className="text-center">
        <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-black">
          Get Your Photos
        </h1>
        <p className="text-lg text-muted-foreground">
          Below are all of the shows, along with any sub-sections of each show.
          Click on the show you'd like to view photos from.
        </p>
      </div>
      {shows.isLoading ? (
        <SpinnerPage />
      ) : !shows.data ? (
        "No shows to display"
      ) : (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {shows.data.map((show: Show) => (
            <Link href={`/photos/shows/${show.slug}`} key={show.id}>
              <Card className="cursor-pointer">
                <CardHeader className="space-y-0 pb-3 pt-4">
                  <h1 className="text-center text-lg font-semibold tracking-tight text-black">
                    {show.name}{" "}
                    <span className="text-sm font-normal text-gray-800">
                      ({show.location})
                    </span>
                  </h1>
                  <h2 className="mt-0 text-center text-sm font-semibold tracking-tight text-black">
                    {show.startDate.toDateString()}{" "}
                    {show.endDate != show.startDate &&
                      `- ${show.endDate?.toDateString()}`}
                  </h2>
                </CardHeader>
                <CardContent className="pb-4">
                  {show.children && show.children.length > 0 ? (
                    <div className="flex flex-row items-center justify-center gap-2">
                      {show.children.map((child: Show) => (
                        <div key={child.id}>
                          <Link
                            href={`/photos/shows/${show.slug}/${child.slug}`}
                            className="text-black underline"
                          >
                            {child.name}
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-6 items-center justify-center">
                      <p className="text-center text-sm text-gray-600">
                        No sub-sections for this show
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

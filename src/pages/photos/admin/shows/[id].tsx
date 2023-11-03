import { ShowChildrenTable } from "@/components/admin/shows/ShowChildrenTable";
import { BarGraph } from "@/components/global/BarGraph";
import { PhotoGallery } from "@/components/shows/PhotoGallery";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ui/card";
import { Spinner } from "@/components/ui/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/ui/tabs";
import { api } from "@/utils/api";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type TABS = "overview" | "photos" | "sub-shows";

export default function Show() {
  const router = useRouter();
  const id = router.query.id as string;
  const [currentTab, setCurrentTab] = useState<TABS>("overview");
  useEffect(() => {
    if (router.query.tab) {
      setCurrentTab(router.query.tab as TABS);
    } else {
      setCurrentTab("overview");
    }
  }, [router.query.tab, id]);

  const showName = api.shows.getShowBasicInfo.useQuery(
    {
      id,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      enabled: !!id,
    }
  );

  useEffect(() => {
    if (!showName.isLoading && !showName.data) {
      window.location.href = "/photos/admin/shows";
    }
  }, [showName]);

  return showName.isLoading || !showName.data ? (
    <Spinner />
  ) : (
    <>
      <main className="container flex-1 space-y-4 p-8 pt-2">
        {showName.data?.parentId && (
          <div className="flex max-h-4 items-start text-sm">
            <Link
              href={`/photos/admin/shows/${showName.data.parentId}`}
              className="text-black underline"
            >
              Go Back
            </Link>
          </div>
        )}
        <div
          className={clsx("flex items-center justify-between", {
            ["mt-7"]: !showName.data?.parentId,
          })}
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-black">
            {showName.data?.name}
          </h1>
        </div>
        <Tabs
          defaultValue="overview"
          value={currentTab}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onValueChange={async (tab) => {
            setCurrentTab(tab as TABS);
            await router.push({
              pathname: router.pathname,
              query: {
                id,
                tab,
              },
            });
          }}
        >
          <TabsList className="mb-4 grid w-fit grid-cols-3">
            <TabsTrigger value="overview" className="px-8">
              Overview
            </TabsTrigger>
            <TabsTrigger value="photos" className="px-8">
              Photos
            </TabsTrigger>
            <TabsTrigger value="sub-shows" className="px-8">
              Sub Shows
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0.00</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sales</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    People Tagged
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">N/A</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                </CardContent>
              </Card>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <BarGraph
                    data={[
                      {
                        name: "Jan",
                        total: Math.floor(Math.random() * 5000) + 1000,
                      },
                      {
                        name: "Feb",
                        total: Math.floor(Math.random() * 5000) + 1000,
                      },
                      {
                        name: "Mar",
                        total: Math.floor(Math.random() * 5000) + 1000,
                      },
                      {
                        name: "Apr",
                        total: Math.floor(Math.random() * 5000) + 1000,
                      },
                      {
                        name: "May",
                        total: Math.floor(Math.random() * 5000) + 1000,
                      },
                      {
                        name: "Jun",
                        total: Math.floor(Math.random() * 5000) + 1000,
                      },
                      {
                        name: "Jul",
                        total: Math.floor(Math.random() * 5000) + 1000,
                      },
                      {
                        name: "Aug",
                        total: Math.floor(Math.random() * 5000) + 1000,
                      },
                      {
                        name: "Sep",
                        total: Math.floor(Math.random() * 5000) + 1000,
                      },
                      {
                        name: "Oct",
                        total: Math.floor(Math.random() * 5000) + 1000,
                      },
                      {
                        name: "Nov",
                        total: Math.floor(Math.random() * 5000) + 1000,
                      },
                      {
                        name: "Dec",
                        total: Math.floor(Math.random() * 5000) + 1000,
                      },
                    ]}
                  />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    You made 0 sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent></CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="photos">
            <PhotoGallery id={id} showName={showName.data?.name} />
          </TabsContent>
          <TabsContent value="sub-shows">
            <ShowChildrenTable id={id} />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

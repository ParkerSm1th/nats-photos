import { ShowChildrenTable } from "@/components/admin/shows/ShowChildrenTable";
import { UploadPhotoDialog } from "@/components/admin/shows/UploadPhoto";
import { BarGraph } from "@/components/global/BarGraph";
import { SpinnerPage } from "@/components/global/Spinner";
import { PhotoGallery } from "@/components/shows/PhotoGallery";
import { Button } from "@/components/ui/ui/button";
import {
  Card,
  CardContent,
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
import RecentSales from "../../../../components/admin/shows/dashboard/recent-sales";
import Stats from "../../../../components/admin/shows/dashboard/stats";

type TABS = "overview" | "photos" | "sub-shows";

export default function Show() {
  const router = useRouter();
  const id = router.query.id as string;
  const [currentTab, setCurrentTab] = useState<TABS>("overview");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: stats, isLoading: isStatsLoading } =
    api.shows.getDashboardStats.useQuery(
      {
        showId: id,
      },
      {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        enabled: !!id,
      }
    );

  const utils = api.useContext();

  const deletePhotosMutation = api.shows.deletePhotos.useMutation();
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkSelections, setBulkSelections] = useState<string[]>([]);
  const [isBulkDeleteLoading, setIsBulkDeleteLoading] = useState(false);

  const bulkDelete = async () => {
    setIsBulkDeleteLoading(true);
    setBulkMode(false);
    try {
      await deletePhotosMutation.mutateAsync(bulkSelections);
      await utils.shows.getShowPhotos.invalidate({
        id,
      });
      setBulkSelections([]);
    } catch (err) {
      console.error(err);
      setBulkMode(true);
    }
    setIsBulkDeleteLoading(false);
  };

  return showName.isLoading || !showName.data ? (
    <SpinnerPage />
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
          <div className="flex justify-between">
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
            {currentTab === "photos" && (
              <div className="flex flex-row gap-2">
                <Button
                  className="mb-4 bg-slate-500 transition-all hover:bg-slate-600"
                  onClick={() => setBulkMode(!bulkMode)}
                  disabled={isBulkDeleteLoading}
                >
                  {bulkMode ? "Disable" : "Enable"} Bulk Mode
                </Button>
                {bulkMode || isBulkDeleteLoading ? (
                  <Button
                    className="mb-4"
                    variant={"destructive"}
                    onClick={() => void bulkDelete()}
                    disabled={
                      bulkSelections.length === 0 || isBulkDeleteLoading
                    }
                  >
                    {isBulkDeleteLoading ? (
                      <Spinner className="h-5 w-5" />
                    ) : (
                      `Delete ${bulkSelections.length} Photos`
                    )}
                  </Button>
                ) : (
                  <Button
                    className="mb-4"
                    onClick={() => setIsUploadOpen(true)}
                  >
                    Upload Photos
                  </Button>
                )}
              </div>
            )}
          </div>
          <TabsContent value="overview">
            <Stats showId={id} />
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
                <RecentSales showId={id} />
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="photos">
            <PhotoGallery
              id={id}
              showName={showName.data?.name}
              adminView
              bulkMode={bulkMode}
              bulkSelections={bulkSelections}
              setBulkSelections={setBulkSelections}
            />
          </TabsContent>
          <TabsContent value="sub-shows">
            <ShowChildrenTable id={id} />
          </TabsContent>
        </Tabs>
        <UploadPhotoDialog
          open={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          showId={id}
        />
      </main>
    </>
  );
}

import { SpinnerPage } from "@/components/global/Spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/ui/tabs";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { useState } from "react";
import { Spinner } from "../../../../components/ui/ui/spinner";

type TABS = "purchases";

export default function Show() {
  const router = useRouter();
  const userId = router.query.id as string;
  const [currentTab, setCurrentTab] = useState<TABS>("purchases");
  const [imagesLoaded, setImagesLoaded] = useState<string[]>([]);

  const { data: purchases, isLoading } = api.shows.getUserPurchases.useQuery(
    {
      userId,
      sinceSeconds: 60 * 60 * 24 * 7,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      enabled: !!userId,
    }
  );

  return isLoading || !purchases ? (
    <SpinnerPage />
  ) : (
    <>
      <main className="container flex-1 space-y-4 p-8 pt-2">
        <div className={"flex items-center justify-between"}>
          <h1 className="text-3xl font-extrabold tracking-tight text-black">
            {purchases.user.firstName} {purchases.user.lastName}
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
                id: userId,
                tab,
              },
            });
          }}
        >
          <div className="flex justify-between">
            <TabsList className="mb-4 grid w-fit grid-cols-3">
              <TabsTrigger value="purchases" className="px-8">
                Purchases
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="purchases">
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {purchases.purchases.map((purchase) => (
                <div
                  key={purchase.photoId}
                  className="relative min-h-[150px] min-w-full cursor-pointer"
                >
                  {/*eslint-disable-next-line @next/next/no-img-element*/}
                  <img
                    src={purchase.link}
                    className="rounded-lg"
                    alt={purchase.photoId}
                    placeholder="blur"
                    loading="lazy"
                    onLoad={() => {
                      setImagesLoaded((prev) => [...prev, purchase.photoId]);
                    }}
                  />
                  {!imagesLoaded.includes(purchase.photoId) ? (
                    <div className="absolute left-0 top-0 flex min-h-full min-w-full items-center justify-center rounded-lg bg-gray-200 text-gray-600">
                      <Spinner />
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/ui/card";
import { Spinner } from "@/components/ui/ui/spinner";
import { api } from "@/utils/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/ui/avatar";

export default function RecentSales({ showId }: { showId: string }) {
  const { data: purchases, isLoading: isPurchasesLoading } =
    api.shows.getRecentSales.useQuery(
      {
        showId,
        sinceSeconds: 60 * 60 * 24 * 7,
      },
      {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        enabled: !!showId,
      }
    );

  return (
    <>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription className="flex flex-row items-center">
          You made{" "}
          {isPurchasesLoading || !purchases ? (
            <Spinner className="mx-0.5 h-4 w-4" />
          ) : (
            purchases.length
          )}{" "}
          sales this month.
        </CardDescription>
      </CardHeader>
      <CardContent className="mb-0 pb-0">
        <div className="max-h-[380px] space-y-8 overflow-y-scroll">
          {isPurchasesLoading ? (
            <Spinner />
          ) : !purchases || purchases.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-md text-muted-foreground">
                No sales to display
              </p>
            </div>
          ) : (
            purchases.map((purchase) => (
              <div className="flex items-center" key={purchase.id}>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={purchase.user?.imageUrl} alt="Avatar" />
                  <AvatarFallback>
                    {purchase.user?.firstName?.charAt(0)}
                    {purchase.user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {purchase.user?.firstName} {purchase.user?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {purchase.photosPurchased}
                  </p>
                </div>
                <div className="ml-auto font-medium text-green-500">
                  +${purchase.photosPurchased * 5}.00
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </>
  );
}

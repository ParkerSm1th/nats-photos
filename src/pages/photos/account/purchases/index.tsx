import { SpinnerPage } from "@/components/global/Spinner";
import { Button } from "@/components/ui/ui/button";
import { Card } from "@/components/ui/ui/card";
import { api } from "@/utils/api";
import Image from "next/image";
import Link from "next/link";

export default function Purchases() {
  const { isLoading, data } = api.user.getPurchases.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
  return isLoading ? (
    <SpinnerPage />
  ) : (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-8 ">
      <div className="text-center">
        <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-black">
          Your purchases
        </h1>
        <p className="text-lg text-muted-foreground">
          You can download the raw photos (no watermark!) below.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {data?.map((purchase) => (
          <Card key={purchase.id} className="bg-slate-50">
            <Image
              src={purchase.image}
              alt={purchase.photoId}
              layout="responsive"
              width={100}
              height={100}
              objectFit="cover"
              className="rounded-t-lg"
            />
            <div className="flex flex-col items-center justify-between space-y-2 py-2">
              <div className="text-center">
                <p className="text-md font-semibold text-black">
                  {purchase.show?.name} ({purchase.show?.location})
                </p>
                <p className="text-md text-slate-900">
                  {purchase.show?.startDate.toLocaleDateString() ??
                    purchase.createdAt.toLocaleDateString()}
                </p>
              </div>
              <Button className="bg-purple-600 transition-all hover:bg-purple-700">
                Download Raw Photo
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

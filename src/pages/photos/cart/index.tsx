import CheckoutButton from "@/components/global/CheckoutButton";
import { Button } from "@/components/ui/ui/button";
import { Separator } from "@/components/ui/ui/separator";
import { useCart } from "@/providers/CartProvider";
import Image from "next/image";

export default function Cart() {
  const { cart, removeFromCart } = useCart();
  return (
    <div className="container flex-1 space-y-4 p-8 pt-2">
      <div className="flex w-full items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold tracking-tight">Cart</h2>
          <p className="text-md text-muted-foreground">
            Below are the items you've added to your cart. By purchasing them
            you will be able to download them watermark-free.
          </p>
        </div>
        <div className="space-y-1">
          <CheckoutButton />
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-col space-y-4">
        {cart.length === 0 && <p className="text-lg">Your cart is empty</p>}
        {cart.map((item) => (
          <div className="flex items-center justify-between" key={item.id}>
            <div className="flex flex-col items-start space-y-4 md:flex-row md:items-start md:space-x-4 md:space-y-0">
              {/* eslint-disable-next-line @next/next/no-img-element*/}
              <Image
                src={item.link}
                alt={item.id}
                className="max-h-[50px] w-auto rounded-lg md:max-h-[150px]"
                height={200}
                width={400}
              />
              <div className="mx-0 flex flex-col md:mx-4">
                <p className="text-lg font-semibold">{item.show.name}</p>
                <p className="text-md text-muted-foreground">{item.id}</p>
              </div>
            </div>
            <div className="flex min-h-full flex-col items-end justify-between space-y-4">
              <p className="text-center text-lg font-semibold">$5</p>
              <button
                className="text-md text-red-500"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

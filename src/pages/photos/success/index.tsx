import { useCart } from "@/providers/CartProvider";
import Link from "next/link";
import { useEffect } from "react";

export default function Success() {
  const { setCart } = useCart();

  useEffect(() => {
    setCart([]);
  }, [setCart]);

  return (
    <div className="flex flex-col items-center space-y-1">
      <h2 className="text-5xl font-semibold tracking-tight">Success!</h2>
      <p className="text-lg text-muted-foreground">
        Your items should show up{" "}
        <Link className="bold underline" href="/photos/account/purchases">
          here
        </Link>{" "}
        shortly.
      </p>
    </div>
  );
}

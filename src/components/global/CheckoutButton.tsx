import { PRICE_PER_PHOTO } from "@/common/constants";
import { HOSTNAME } from "@/lib/utils";
import { useCart } from "@/providers/CartProvider";
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { api } from "@/utils/api";
import { useAuth } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/router";
import { useState } from "react";

import { Button } from "../ui/button";
import { Spinner } from "../ui/ui/spinner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CheckoutButton = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);
  const getCheckout = api.stripe.createCheckoutSession.useMutation();

  const handleCheckout = async () => {
    if (!userId) {
      await router.push(`/sign-in?redirect_url=${HOSTNAME()}/photos/cart`);
      return;
    }
    setLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe.js hasn't loaded yet!");
      }
      const data = await getCheckout.mutateAsync({
        items: cart.map((item) => ({
          id: item.id,
          showName: item.show.name,
        })),
      });
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      setLoading(false);

      if (error) {
        await router.push("/error");
      }
    } catch (err) {
      console.error("Error in creating checkout session:", err);
      setLoading(false);
      await router.push("/error");
    }
  };

  return (
    <Button
      onClick={cart.length === 0 ? () => null : handleCheckout}
      disabled={cart.length === 0}
    >
      <div
        style={{
          opacity: loading ? 1 : 0,
          position: "absolute",
        }}
      >
        <Spinner />
      </div>
      <div
        style={{
          opacity: loading ? 0 : 1,
        }}
      >
        Checkout ${cart.length * PRICE_PER_PHOTO}
      </div>
    </Button>
  );
};

export default CheckoutButton;

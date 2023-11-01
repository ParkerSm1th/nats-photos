/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { api } from "@/utils/api";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import { useState } from "react";

import { Button } from "../ui/button";
import { Spinner } from "../ui/ui/spinner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CheckoutButton = ({ amount }: { amount: number }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const getCheckout = api.stripe.createCheckoutSession.useMutation();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe.js hasn't loaded yet!");
      }
      const data = await getCheckout.mutateAsync({
        amount,
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
    <Button onClick={handleCheckout}>
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
        Checkout ${amount}
      </div>
    </Button>
  );
};

export default CheckoutButton;

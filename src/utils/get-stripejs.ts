import { loadStripe, type Stripe } from "@stripe/stripe-js";

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  if (!stripePromise) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export default getStripe;

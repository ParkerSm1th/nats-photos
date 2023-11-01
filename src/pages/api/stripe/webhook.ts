/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { buffer } from "micro";
import { type NextApiRequest, type NextApiResponse } from "next";
import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});
const webhookSecret = process.env.STRIPE_SIGNING_SECRET!;

type Metadata = {
  userId: string;
  chargeId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"] ?? "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      res
        .status(400)
        .send(
          `Webhook Error: ${
            err instanceof Error ? err.message : "Unknown Error"
          }`
        );
      return;
    }

    switch (event.type) {
      case "checkout.session.completed":
        const completedEvent = event.data.object as Stripe.Checkout.Session & {
          metadata: Metadata;
        };
        console.log("💰 Payment received!", completedEvent);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.send(200);
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Stripe } from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const origin = process.env.NEXT_PUBLIC_ORIGIN!;
export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(z.object({ amount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Photos",
              },
              unit_amount: input.amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/success`,
        cancel_url: `${origin}/`,
        metadata: {
          userId: ctx.auth.userId,
          chargeId: "456",
        },
      });
      return { sessionId: session.id };
    }),
});

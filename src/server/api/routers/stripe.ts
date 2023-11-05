import { PRICE_PER_PHOTO } from "@/common/constants";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Stripe } from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const origin = process.env.NEXT_PUBLIC_ORIGIN!;
export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            image: z.string(),
            showName: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: input.items.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: `Photo from ${item.showName}`,
              images: [item.image],
            },
            unit_amount: PRICE_PER_PHOTO * 100,
          },
          quantity: 1,
        })),
        allow_promotion_codes: true,
        mode: "payment",
        success_url: `${origin}/photos/success`,
        cancel_url: `${origin}/photos/cart`,
        metadata: {
          userId: ctx.auth.userId,
          photos: JSON.stringify(input.items.map((x) => x.id)),
        },
      });
      return { sessionId: session.id };
    }),
});

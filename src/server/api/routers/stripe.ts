import { PRICE_PER_PHOTO } from "@/common/constants";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Stripe } from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const origin = process.env.NEXT_PUBLIC_ORIGIN!;

function splitPhotosIntoMetadata(photoIds: string[], maxCharsPerKey = 500) {
  // @ts-expect-error -- unknown
  const metadata: Record<string, string> & { numKeys: number } = {};
  const maxIdsPerChunk = Math.floor(maxCharsPerKey / 40); // assuming each ID is a 36-char UUID + 1 separator (comma or space)
  
  let chunkCount = 1;
  for (let i = 0; i < photoIds.length; i += maxIdsPerChunk) {
      const chunk = photoIds.slice(i, i + maxIdsPerChunk);
      metadata[`photos-${chunkCount}`] = JSON.stringify(chunk);
      chunkCount++;
  }
  
  metadata.numKeys = chunkCount - 1;
  return metadata;
}

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

      // With stripe each metadata key can only be 500 characters long,
      // so we need to store the photo objects in a separate object
      // and store the keys in the metadata and how to reconstruct the
      // photo objects in the metadata.
      const metadata = splitPhotosIntoMetadata(input.items.map((x) => x.id));
        

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
          ...metadata,
        },
      });
      return { sessionId: session.id };
    }),
});

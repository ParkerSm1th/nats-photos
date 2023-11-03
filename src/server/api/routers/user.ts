import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import Jimp from "jimp";
import { z } from "zod";

import { S3Service } from "../services/S3Service/S3Service";
import { WatermarkService } from "../services/WatermarkService/WatermarkService";

export const userRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getPurchases: protectedProcedure.query(async ({ ctx }) => {
    const purchases = await ctx.prisma.purchases.findMany({
      where: {
        userId: ctx.auth.userId,
      },
    });
    const photos = await ctx.prisma.photo.findMany({
      where: {
        id: {
          in: purchases.map((purchase) => purchase.photoId),
        },
      },
    });
    const shows = await ctx.prisma.show.findMany({
      where: {
        id: {
          in: photos.map((photo) => photo.showId),
        },
      },
    });
    return purchases.map((purchase) => {
      const photo = photos.find((photo) => photo.id === purchase.photoId);
      return {
        ...purchase,
        image:
          "https://res.cloudinary.com/dqdjvho5d/image/upload/v1691816627/2_axc1ll.jpg",
        show: shows.find((show) => show.id === photo?.showId),
      };
    });
  }),

  testPhoto: publicProcedure.query(async () => {
    const s3Service = new S3Service("natalies-photos");
    const preSign = s3Service.getPresignedLink("med.jpeg", 60);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const LOGO_URL =
      "https://www.natalielockhartphotos.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FWhiteSmallLogo.6feb2cc1.png&w=640&q=75";
    const logo = await Jimp.read(LOGO_URL);
    const watermarkService = new WatermarkService(logo);
    const image = await watermarkService.getWatermarkedImage(preSign);
    const base64 = await image.getBase64Async(Jimp.MIME_PNG);
    return {
      url: base64,
    };
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});

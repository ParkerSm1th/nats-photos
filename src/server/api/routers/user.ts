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

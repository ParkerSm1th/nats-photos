import { clerkClient } from "@clerk/nextjs";

import type { User } from "@clerk/nextjs/dist/types/server";
import type { Show as PrismaShow, Show } from "@prisma/client";
import fastDeepEqual from "fast-deep-equal/es6";
import Jimp from "jimp";
import JPEG from "jpeg-js";
import { z } from "zod";

import { S3Service } from "../services/S3Service/S3Service";
import { WatermarkService } from "../services/WatermarkService/WatermarkService";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import {
  cacheGetJSON,
  cacheSetJSON,
  getRedisStatus,
  invalidateCache,
  reconnectRedis,
} from "../utils/redis";

const s3Service = new S3Service("natalies-photos");

export const showRouter = createTRPCRouter({
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const show = await ctx.prisma.show.delete({
        where: { id: input.id },
      });
      return fromPrisma(show);
    }),
  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        location: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const show = await ctx.prisma.show.create({
        data: {
          name: input.name,
          slug: input.name.toLowerCase().replace(/ /g, "-"),
          location: input.location,
          startDate: input.startDate,
          endDate: input.endDate,
          parentId: input.parentId,
        },
      });
      return fromPrisma(show);
    }),
  getShow: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const show = await ctx.prisma.show.findUnique({
        where: { id: input.id },
      });
      if (!show) return null;
      const childShows = await ctx.prisma.show.findMany({
        where: { parentId: input.id },
        orderBy: { startDate: "asc" },
      });
      return {
        ...show,
        children: childShows,
      };
    }),
  getShowChildren: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const shows = await ctx.prisma.show.findMany({
        where: { parentId: input.id },
        orderBy: { startDate: "desc" },
      });
      return shows.map((s) => fromPrisma(s));
    }),
  getAll: publicProcedure
    .input(
      z.object({
        includeChildren: z.boolean().optional(),
        limit: z.number().optional(),
        orderByStartDate: z.enum(["asc", "desc"]).optional(),
      })
    )
    .query(async ({ ctx, input }): Promise<Show[]> => {
      const rawShows = await ctx.prisma.show.findMany({
        orderBy: { startDate: input.orderByStartDate ?? "desc" },
        take: input.limit ? input.limit : undefined,
      });
      const reducedShows = rawShows.reduce((acc, show) => {
        const showWithChildren = {
          ...show,
          children: rawShows
            .filter((s) => s.parentId === show.id)
            .sort((a, b) => {
              if (a.startDate < b.startDate) return -1;
              if (a.startDate > b.startDate) return 1;
              return 0;
            })
            .map((s) => fromPrisma(s)),
        };
        if (show.parentId === null) {
          acc.push(showWithChildren);
        }
        return acc;
      }, [] as Show[]);
      const shows = reducedShows.map((s) => fromPrisma(s));
      return shows;
    }),
  getShowsBySlug: publicProcedure
    .input(z.array(z.string()))
    .query(async ({ ctx, input }) => {
      const rawShows = await ctx.prisma.show.findMany({
        where: { slug: { in: input } },
        orderBy: { startDate: "desc" },
      });
      return rawShows.map((s) => fromPrisma(s));
    }),
  getShowBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const rawShow = await ctx.prisma.show.findUnique({
        where: { slug: input.slug },
      });
      if (!rawShow) return null;
      const childShows = await ctx.prisma.show.findMany({
        where: { parentId: rawShow.id },
        orderBy: { startDate: "asc" },
      });
      return {
        ...rawShow,
        children: childShows,
      };
    }),
  getShowNameBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const rawShow = await ctx.prisma.show.findUnique({
        where: { slug: input.slug },
      });
      if (!rawShow) return null;
      return rawShow.name;
    }),
  getShowBasicInfo: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rawShow = await ctx.prisma.show.findUnique({
        select: {
          name: true,
          parentId: true,
        },
        where: { id: input.id },
      });
      if (!rawShow) return null;
      return rawShow;
    }),
  getShowPhotos: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const photos = await ctx.prisma.photo.findMany({
        where: { showId: input.id },
      });
      // TODO: Make this a helper function
      if (!getRedisStatus()?.isOpen) {
        reconnectRedis();
      }
      const cachedUrls =
        (await cacheGetJSON("showPhotosLinks", input.id)) ?? {};
      let urlsToAdd = {
        ...cachedUrls,
      };
      const returnedPhotos = await Promise.all(
        photos.map((photo) => {
          const cachedUrl = cachedUrls[photo.id];
          let url = cachedUrl?.url;
          if (
            !url ||
            (cachedUrl?.expiresAt && cachedUrl?.expiresAt < Date.now())
          ) {
            url = s3Service.getPresignedLink(
              photo.id + "-watermark.jpg",
              604800
            );
            urlsToAdd = {
              ...urlsToAdd,
              [photo.id]: {
                url,
                expiresAt: Date.now() + 604700000,
              },
            };
          }
          return {
            ...photo,
            url,
          };
        })
      );
      if (!fastDeepEqual(urlsToAdd, cachedUrls))
        await cacheSetJSON("showPhotosLinks", input.id, urlsToAdd, 604800);
      return returnedPhotos;
    }),
  invalidateShowPhotosLinksCache: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await invalidateCache("showPhotosLinks", input.id);
      return true;
    }),
  getPresignedUploadLink: adminProcedure
    .input(
      z.object({
        photoKey: z.string(),
        type: z.string(),
      })
    )
    .mutation(({ input }) => {
      const s3Service = new S3Service("natalies-photos");
      const preSign = s3Service.getPresignedUploadLink(
        {
          key: input.photoKey,
          type: input.type,
        },
        60
      );
      return {
        url: preSign,
      };
    }),
  getDashboardStats: adminProcedure
    .input(
      z.object({
        showId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const children = await ctx.prisma.show.findMany({
        where: {
          parentId: input.showId,
        },
      });
      const childIds = children.map((c) => c.id);
      const purchases = await ctx.prisma.purchases.findMany({
        where: {
          photo: {
            showId: {
              in: [...childIds, input.showId],
            },
          },
        },
      });
      return {
        purchases: purchases.length,
        sales: purchases.length * 5,
      };
    }),
  getRecentSales: adminProcedure
    .input(
      z.object({
        showId: z.string().uuid(),
        limit: z.number().optional(),
        sinceSeconds: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const children = await ctx.prisma.show.findMany({
        where: {
          parentId: input.showId,
        },
      });
      const childIds = children.map((c) => c.id);
      const purchases = await ctx.prisma.purchases.findMany({
        where: {
          photo: {
            showId: {
              in: [...childIds, input.showId],
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit ? input.limit : 10,
      });
      // use await clerkClient.users.getUser(purchase.userId) to get all of the users
      // from all of the purchases
      const users = await Promise.all(
        purchases.map((p) => clerkClient.users.getUser(p.userId))
      );
      // reduce purchases down based on their createdAt date
      // and the userId
      const reducedPurchases = purchases.reduce(
        (
          acc: {
            id: string;
            userId: string;
            user?: User;
            stripeCheckoutId: string;
            createdAt: Date;
            photosPurchased: number;
          }[],
          purchase
        ) => {
          const existingPurchase = acc.find(
            (p) =>
              (p.createdAt.toISOString() === purchase.createdAt.toISOString() &&
                p.userId === purchase.userId) ||
              p.stripeCheckoutId === purchase.stripeCheckoutId
          );
          if (existingPurchase) {
            existingPurchase.photosPurchased += 1;
          } else {
            acc.push({
              ...purchase,
              user: users.find((u) => u.id === purchase.userId),
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              stripeCheckoutId: purchase.stripeCheckoutId ?? "",
              photosPurchased: 1,
            });
          }
          return acc;
        },
        []
      );
      return reducedPurchases;
    }),
  getUserPurchases: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().optional(),
        sinceSeconds: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const purchases = await ctx.prisma.purchases.findMany({
        where: {
          userId: input.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        ...(input.limit
          ? {
              take: input.limit,
            }
          : {}),
      });
      const user = await clerkClient.users.getUser(input.userId);
      const purchasesWithLinks = purchases.map((purchase) => {
        const link = s3Service.getPresignedLink(
          purchase.photoId + "-watermark.jpg",
          604800
        );
        return {
          ...purchase,
          link,
        };
      });
      return {
        user,
        purchases: purchasesWithLinks,
      };
    }),
  addPhoto: adminProcedure
    .input(
      z.object({
        showId: z.string().uuid(),
        photoId: z.string().uuid(),
        base64: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      Jimp.decoders["image/jpeg"] = (data) =>
        JPEG.decode(data, { maxMemoryUsageInMB: 60000 });
      const image = await Jimp.read(Buffer.from(input.base64, "base64"));
      const watermarkService = new WatermarkService(
        await Jimp.read(
          "https://res.cloudinary.com/dqdjvho5d/image/upload/v1699069051/WhiteSmallLogo_kppgao.png"
        )
      );
      const waterMarked = watermarkService.getWatermarkedImage(image);
      const previewUploadUrl = s3Service.getPresignedUploadLink(
        {
          key: input.photoId + "-watermark.jpg",
          type: "image/jpeg",
        },
        60
      );
      await fetch(previewUploadUrl, {
        method: "PUT",
        headers: new Headers({ "Content-Type": "image/jpeg" }),
        body: await waterMarked.getBufferAsync(Jimp.MIME_JPEG),
      });
      const photo = await ctx.prisma.photo.upsert({
        where: { id: input.photoId },
        update: {},
        create: { id: input.photoId, showId: input.showId },
      });
      return photo;
    }),
  deletePhoto: adminProcedure
    .input(z.object({ photoId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const photo = await ctx.prisma.photo.delete({
        where: { id: input.photoId },
      });
      await s3Service.deleteObject(photo.id + "-watermark.jpg");
      await s3Service.deleteObject(photo.id + ".jpg");
      return photo;
    }),
  deletePhotos: adminProcedure
    .input(z.array(z.string().uuid()))
    .mutation(async ({ ctx, input }) => {
      const photo = await ctx.prisma.photo.deleteMany({
        where: { id: { in: input } },
      });
      for (const p of input) {
        await s3Service.deleteObject(p + "-watermark.jpg");
        await s3Service.deleteObject(p + ".jpg");
      }
      return photo;
    }),
});

type ShowWithChildren = Partial<PrismaShow> & { children?: Show[] };

const fromPrisma = (show: ShowWithChildren, children = true): Show => {
  return {
    id: show.id!,
    name: show.name!,
    slug: show.slug!,
    location: show.location!,
    startDate: show.startDate!,
    endDate: show.endDate ? show.endDate : null,
    createdAt: show.createdAt!,
    updatedAt: show.updatedAt!,
    parentId: show.parentId ? show.parentId : null,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    isPublic: show.isPublic!,
    ...(children && {
      children: show.children?.map((s) => fromPrisma(s, false)),
    }),
  };
};

export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: "20mb", // Set desired value here
    },
  },
};

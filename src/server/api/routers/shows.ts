import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { type Show as PrismaShow } from "@prisma/client";

export const showRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }): Promise<Show[]> => {
    const rawShows = await ctx.prisma.show.findMany({
      orderBy: { startDate: "desc" },
    });
    const reducedShows = rawShows.reduce((acc, show) => {
      const showWithChildren = {
        ...show,
        children: rawShows
          .filter((s) => s.parentId === show.id)
          .map(fromPrisma),
      };
      if (show.parentId === null) {
        acc.push(showWithChildren);
      }
      return acc;
    }, [] as Show[]);
    const shows = reducedShows.map(fromPrisma);
    return shows;
  }),
  getShowsBySlug: publicProcedure
    .input(z.array(z.string()))
    .query(async ({ ctx, input }) => {
      const rawShows = await ctx.prisma.show.findMany({
        where: { slug: { in: input } },
        orderBy: { startDate: "desc" },
      });
      return rawShows.map(fromPrisma);
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
        orderBy: { startDate: "desc" },
      });
      return {
        ...rawShow,
        children: childShows,
      };
    }),
});

type ShowWithChildren = Partial<PrismaShow> & { children?: Show[] };

const fromPrisma = (show: ShowWithChildren): Show => {
  return {
    id: show.id!,
    name: show.name!,
    slug: show.slug! as string,
    location: show.location!,
    startDate: show.startDate! as Date,
    endDate: show.endDate ? (show.endDate as Date) : undefined,
    createdAt: show.createdAt!,
    updatedAt: show.updatedAt!,
    children: show.children?.map(fromPrisma),
  };
};

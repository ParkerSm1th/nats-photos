import { type Show as PrismaShow, type Show } from "@prisma/client";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

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
    ...(children && {
      children: show.children?.map((s) => fromPrisma(s, false)),
    }),
  };
};

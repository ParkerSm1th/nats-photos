import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const showRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.show.findMany();
  }),
  getShowBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.show.findUnique({
        where: { slug: input.slug },
      });
    }),
});

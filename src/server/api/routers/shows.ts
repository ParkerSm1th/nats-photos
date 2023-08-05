import { createTRPCRouter, publicProcedure } from "../trpc";

export const showRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.show.findMany();
  }),
});

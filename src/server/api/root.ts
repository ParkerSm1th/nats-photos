import { userRouter } from "@/server/api/routers/user";
import { createTRPCRouter } from "@/server/api/trpc";

import { showRouter } from "./routers/shows";

export const appRouter = createTRPCRouter({
  user: userRouter,
  shows: showRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

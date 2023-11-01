import { userRouter } from "@/server/api/routers/user";
import { createTRPCRouter } from "@/server/api/trpc";

import { showRouter } from "./routers/shows";
import { stripeRouter } from "./routers/stripe";

export const appRouter = createTRPCRouter({
  user: userRouter,
  shows: showRouter,
  stripe: stripeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

import { createTRPCRouter } from "../trpc";
import { gamesRouter } from "./games";
import { postsRouter } from "./posts";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  posts: postsRouter,
  games: gamesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

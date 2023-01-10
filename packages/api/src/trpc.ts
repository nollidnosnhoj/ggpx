import { getServerSession, Session } from "@ggpx/auth";
import { ICacheStore, RedisStore } from "@ggpx/cache";
import { prisma } from "@ggpx/db";
import { IStorage, S3Storage } from "@ggpx/storage";
import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/dist/adapters/next";
import superjson from "superjson";
import { env } from "./env.js";

export const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    transformer: superjson,
    errorFormatter({ shape }) {
      return shape;
    },
  });

export const createTRPCRouter = t.router;

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API
 *
 * These allow you to access things like the database, the session, etc, when
 * processing a request
 *
 */

type CreateContextOptions = {
  session: Session | null;
  storage: IStorage;
  cache: ICacheStore;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 *
 * Examples of things you may need it for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
    cache: opts.cache,
    storage: opts.storage,
  };
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createTRPCContext = async (ctx: CreateNextContextOptions) => {
  // Get the session from the server using the unstable_getServerSession wrapper function
  const session = await getServerSession(ctx);
  const cache = new RedisStore({ host: env.REDIS_HOST, port: env.REDIS_PORT });
  const storage = new S3Storage({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY,
      secretAccessKey: env.AWS_SECRET_KEY,
    },
  });

  return createInnerTRPCContext({
    session,
    cache,
    storage,
  });
};

export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

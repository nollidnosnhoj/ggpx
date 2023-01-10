/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API
 *
 * These allow you to access things like the database, the session, etc, when
 * processing a request
 *
 */
import type { Session } from "next-auth";
import type { CreateNextContextOptions } from "@trpc/server/dist/adapters/next";
import { prisma } from "@ggpx/db";
import { RedisStore, type ICacheStore } from "@ggpx/cache";
import { S3Storage, type IStorage } from "@ggpx/storage";
import { getServerSession } from "@ggpx/auth";
import { env } from "./env.mjs";

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

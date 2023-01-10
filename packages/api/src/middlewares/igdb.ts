import { env } from "../env.mjs";
import IgdbClient from "../igdb";
import { t } from "../trpc";

const addIgdbClient = t.middleware(({ ctx, next }) => {
  return next({
    ctx: {
      igdb: new IgdbClient(
        {
          clientId: env.TWITCH_CLIENT_ID,
          clientSecret: env.TWITCH_CLIENT_SECRET,
        },
        ctx.cache,
      ),
    },
  });
});

export default addIgdbClient;

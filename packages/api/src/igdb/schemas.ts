import { z } from "zod";

export const accessTokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
});

export const coverSchema = z.object({
  id: z.number(),
  image_id: z.string(),
  url: z.string(),
  checksum: z.string(),
});

export const gameSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  cover: coverSchema,
});

export const gamesSchema = z.array(gameSchema);

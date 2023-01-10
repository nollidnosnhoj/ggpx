import type { z } from 'zod';
import type { accessTokenSchema, coverSchema, gameSchema, gamesSchema } from './schemas';

export type AccessToken = z.infer<typeof accessTokenSchema>;
export type IgdbGame = z.infer<typeof gameSchema>;
export type IgdbGames = z.infer<typeof gamesSchema>;
export type IgdbCover = z.infer<typeof coverSchema>;

import { z } from "zod";
import addIgdbClient from "../middlewares/igdb";
import { protectedProcedure, publicProcedure, createTRPCRouter } from "../trpc";

import type { PrismaClient } from "@prisma/client";
import type { default as IgdbClient } from "../igdb";

export const getGameByIds = async (
  ids: number[],
  prisma: PrismaClient,
  igdb: IgdbClient,
) => {
  const distinctIds = [...new Set(ids)];
  const dbGames = await prisma.game.findMany({
    where: {
      id: {
        in: distinctIds,
      },
    },
  });
  if (dbGames.length === ids.length) return dbGames;
  const nonDbGameIds = distinctIds.filter(
    (id) => !dbGames.some((g) => g.id === id),
  );
  const result = await igdb.getGames(nonDbGameIds);
  if (!result) return false;
  return [...dbGames, ...result];
};

export const gamesRouter = createTRPCRouter({
  searchIgdb: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .use(addIgdbClient)
    .query(async ({ ctx: { igdb }, input }) => {
      return await igdb.searchGames(input.query, 10);
    }),
  list: publicProcedure
    .input(z.object({ take: z.number().default(10) }))
    .query(async ({ ctx: { prisma }, input }) => {
      return await prisma.game.findMany({
        orderBy: {
          name: "asc",
        },
        take: input.take,
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });
    }),
});

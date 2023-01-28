import { createPostsSchema, uploadImageSchema } from "@ggpx/lib";
import type { Game, PrismaClient } from "@ggpx/db";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { env } from "../env";
import addIgdbClient from "../middlewares/igdb";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { splitFileName, getContentType } from "../file";
import type { default as IgdbClient } from "../igdb";

const getBatchGamesForPosts = async (
  map: Map<string, number>,
  prisma: PrismaClient,
  igdb: IgdbClient
) => {
  const foundGamesMap = new Map<string, Game>();
  const iter = [...map];
  const dbGames = await prisma.game.findMany({
    where: { id: { in: iter.map((x) => x[1]) } },
  });

  const nonDbGamesId: [string, number][] = [];
  iter.forEach(([uploadId, gameId]) => {
    const gameFound = dbGames.find((x) => x.id === gameId);
    if (gameFound) {
      foundGamesMap.set(uploadId, gameFound);
      return;
    }
    nonDbGamesId.push([uploadId, gameId]);
  });

  if (nonDbGamesId.length > 0) {
    const igdbResults = await igdb.getGames(nonDbGamesId.map((x) => x[1]));
    nonDbGamesId.forEach(([uploadId, gameId]) => {
      const gameFound = igdbResults.find((x) => x.id === gameId);
      if (gameFound) {
        foundGamesMap.set(uploadId, gameFound);
        return;
      }
    });
  }

  return foundGamesMap;
};

export const postsRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(uploadImageSchema)
    .mutation(
      async ({
        ctx: { prisma, session, storage },
        input: { fileName, fileSize },
      }) => {
        const id = nanoid(8);
        const [, ext] = splitFileName(fileName);
        const contentType = getContentType(ext);

        if (!contentType) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid file type.",
          });
        }

        await prisma.upload.create({
          data: {
            id,
            fileExtension: ext,
            fileName,
            fileSize,
            fileType: contentType,
          },
        });

        const generateResponse = await storage.getPresignedPost({
          container: env.UPLOAD_BUCKET,
          key: `uploads/posts/original/${id}${ext}`,
          expiration: 300,
          size: fileSize,
          fields: {
            "Content-Type": contentType,
            "User-Id": session.user.id,
          },
        });

        return {
          id,
          ...generateResponse,
        };
      }
    ),
  create: protectedProcedure
    .input(createPostsSchema)
    .use(addIgdbClient)
    .mutation(async ({ ctx: { prisma, session, igdb }, input }) => {
      const batchGames = await getBatchGamesForPosts(
        new Map<string, number>(
          input.map(({ uploadId, gameId }) => [uploadId, gameId])
        ),
        prisma,
        igdb
      );

      const promises = input.map(
        async ({
          uploadId: id,
          title,
          imageWidth,
          imageHeight,
          caption,
          tags,
        }) => {
          const upload = await prisma.upload.findUnique({
            where: {
              id,
            },
          });

          if (!upload) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid identifier.",
            });
          }

          const { fileExtension, fileSize, fileType } = upload;

          if (!title) {
            title = tags.join(" ");
          }

          const game = batchGames.get(id);

          if (!game) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid game.",
            });
          }

          const createPost = prisma.post.create({
            data: {
              id,
              fileExtension,
              fileSize,
              fileType,
              imageHeight,
              imageWidth,
              title,
              caption,
              author: {
                connect: {
                  id: session.user.id,
                },
              },
              game: {
                connectOrCreate: {
                  where: {
                    id: game.id,
                  },
                  create: game,
                },
              },
            },
          });

          const deleteUpload = prisma.upload.delete({ where: { id } });

          await prisma.$transaction([createPost, deleteUpload]);
        }
      );

      await Promise.all(promises);
    }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx: { prisma }, input }) => {
      return await prisma.post.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          title: true,
          caption: true,
          fileExtension: true,
          fileType: true,
          fileSize: true,
          imageHeight: true,
          imageWidth: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          game: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });
    }),
});

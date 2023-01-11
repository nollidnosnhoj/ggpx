import { z } from "zod";
import { tagsSchema } from "./tags";

const accepts = {
  "image/*": [".jpg", ".png"],
};

const maxFileSize = 1_000_000_000;

export const uploadImagesSchema = z
  .object({
    fileName: z.string().refine(
      (fileName) => {
        const exts = Object.values(accepts).flatMap((x) => x);
        exts.forEach((ext) => {
          if (fileName.endsWith(ext)) {
            return true;
          }
        });
        return false;
      },
      { message: "Invalid file name." }
    ),
    fileSize: z.number().max(maxFileSize),
  })
  .array()
  .min(1)
  .max(10);

export const createPostsSchema = z
  .object({
    uploadId: z.string().min(1, "Upload id is required."),
    title: z.string().max(50).optional(),
    caption: z.string().max(200).optional(),
    gameId: z.number().min(1),
    imageWidth: z.number().min(720),
    imageHeight: z.number().min(720),
    tags: tagsSchema,
  })
  .array()
  .min(1)
  .max(10);

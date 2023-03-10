import { z } from "zod";
import { tagsSchema } from "./tags";

const accepts = {
  "image/*": [".jpg", ".png"],
};

const acceptTypes = ["image/jpeg", "image/png"];
const maxFileSize = 1_000_000_000;

export const uploadImageSchema = z.object({
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
});

export const createPostSchema = z.object({
  uploadId: z.string().min(1, "Upload id is required."),
  title: z.string().max(50).optional(),
  caption: z.string().max(200).optional(),
  gameId: z.number().min(1),
  imageWidth: z.number().min(720),
  imageHeight: z.number().min(720),
  tags: tagsSchema,
});

export const createPostsSchema = createPostSchema
  .array()
  .min(1)
  .max(10)
  .refine((arr) => {
    const set = new Set(arr.map((x) => x.uploadId));
    return set.size === arr.length;
  }, "Upload id must be unique.");

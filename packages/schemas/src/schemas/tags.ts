import slug from "slug";
import { z } from "zod";

export const tagsSchema = z
  .string()
  .min(3)
  .max(15)
  .transform((word) => {
    return slug(word);
  })
  .array()
  .min(3)
  .max(15)
  .refine((tags) => tags.join("").length <= 50, {
    message: `Tags cannot be more than 50 characters long altogether.`,
  });

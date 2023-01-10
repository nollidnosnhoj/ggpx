import slug from "slug";
import { z } from "zod";

type TagsSchemaConfig = {
  minimumTags?: number;
  maximumTags?: number;
  minimumCharacters?: number;
  maximumCharacters?: number;
  maximumTotalCharacters?: number;
  slugOptions?: slug.Options;
};
export const tagsSchema = ({
  minimumTags = 3,
  maximumTags = 15,
  minimumCharacters = 3,
  maximumCharacters = 3,
  maximumTotalCharacters = 50,
  slugOptions,
}: TagsSchemaConfig) =>
  z
    .string()
    .min(minimumCharacters)
    .max(maximumCharacters)
    .transform((word) => {
      return slug(word, slugOptions);
    })
    .array()
    .min(minimumTags)
    .max(maximumTags)
    .refine((tags) => tags.join("").length <= maximumTotalCharacters, {
      message: `Tags cannot be more than ${maximumTotalCharacters} characters long altogether.`,
    });

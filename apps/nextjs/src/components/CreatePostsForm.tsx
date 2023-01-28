import React from "react";
import { createPostSchema, createPostsSchema } from "@ggpx/lib";
import { FileDropzone } from "@ggpx/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const MAX_FILES = 10;

export const formSchema = z.object({
  posts: createPostSchema
    .merge(
      z.object({
        file: typeof window === "undefined" ? z.any() : z.instanceof(File),
        status: z.enum(["uploaded", "error"]).optional(),
      })
    )
    .array()
    .min(1)
    .max(10),
});
export type CreatePostsFormValues = z.infer<typeof formSchema>;

export const CreatePostsForm: React.FC = () => {
  const form = useForm<CreatePostsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      posts: [],
    },
  });

  const fieldArr = useFieldArray({ control: form.control, name: "posts" });

  const handleFileDrop = (files: File[]) => {
    fieldArr.prepend(
      files.map((result) => ({
        gameId: 0,
        imageHeight: 0,
        imageWidth: 0,
        tags: [],
        uploadId: "",
        caption: undefined,
        title: result.name,
        file: result,
      }))
    );
  };

  return (
    <div>
      <FileDropzone
        maxSize={1_000_000_000}
        maxFiles={MAX_FILES}
        multiple
        accept={{ "image/*": [".png", ".jpg"] }}
        onDropAccepted={handleFileDrop}
      >
        {() => (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              aria-hidden="true"
              className="mb-3 h-10 w-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              SVG, PNG, JPG or GIF (MAX. 800x400px)
            </p>
          </div>
        )}
      </FileDropzone>
    </div>
  );
};

import React from "react";
import { DropzoneOptions, DropzoneState, useDropzone } from "react-dropzone";
import { cn } from "../utils";

type FileDropzone = DropzoneOptions & {
  children: (
    props: Pick<DropzoneState, "isDragAccept" | "isDragReject" | "isDragActive">
  ) => React.ReactNode;
};
export const FileDropzone: React.FC<FileDropzone> = ({
  children,
  ...props
}) => {
  const dropzone = useDropzone(props);

  return (
    <section>
      <div
        {...dropzone.getRootProps({
          className: cn(
            "",
            "dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600",
            dropzone.isDragAccept && "border-gree-300",
            dropzone.isDragReject && "border-red-300"
          ),
        })}
      >
        {children(dropzone)}
        <input {...dropzone.getInputProps()} />
      </div>
    </section>
  );
};

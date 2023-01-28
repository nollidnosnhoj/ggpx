import { cn } from "@ggpx/ui";
import axios from "axios";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FieldPath, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
import { useFileReader } from "../lib/hooks/useFileReader";
import { api } from "../utils/api";
import { CreatePostsFormValues, formSchema } from "./CreatePostsForm";

type UploadImageFormProps = {
  index: number;
  file: File;
};

const useImageValidation = (file: File, index: number) => {
  const { formState, setValue, trigger, control, getFieldState } =
    useFormContext<CreatePostsFormValues>();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [base64, { loading: fileLoading, error: fileError }] = useFileReader(
    file,
    "readAsText",
    {
      onError: () => {
        setValue(`posts.${index}.status`, "error");
      },
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const imageWidth = useWatch({ control, name: `posts.${index}.imageWidth` });
  const imageHeight = useWatch({ control, name: `posts.${index}.imageHeight` });
  const { error: widthError } = getFieldState(
    `posts.${index}.imageWidth`,
    formState
  );
  const { error: heightError } = getFieldState(
    `posts.${index}.imageWidth`,
    formState
  );

  useEffect(() => {
    if (!file && imageRef.current) {
      imageRef.current = null;
    }
  }, [file]);

  useEffect(() => {
    if (!base64) return;
    const image = new Image();
    image.onloadstart = () => setLoading(true);
    image.onloadedmetadata = () => {
      setLoading(false);
      imageRef.current = image;
      setValue(`posts.${index}.imageWidth`, image.width);
      setValue(`posts.${index}.imageHeight`, image.height);
      trigger([`posts.${index}.imageWidth`, `posts.${index}.imageHeight`]);
    };
    image.onerror = (event, source, lineno, colno, imgError) => {
      setError(imgError ?? null);
      setValue(`posts.${index}.status`, "error");
    };
    image.src = base64 as string;
  }, [base64]);

  const allError = useMemo(() => {
    if (fileError) return fileError.message;
    if (error) return error.message;
    if (!!widthError || !!heightError)
      return "Image must be at least 720 by 720 pixels.";
    return undefined;
  }, [fileError, error, widthError, heightError]);

  const isValid = imageWidth > 0 && imageHeight > 0 && !allError;

  return {
    data: base64 as string,
    width: imageRef.current?.height,
    height: imageRef.current?.width,
    valid: isValid,
    loading: fileLoading && loading,
    error: allError,
  };
};

const UploadImageForm: React.FC<UploadImageFormProps> = ({ index, file }) => {
  const { formState, setValue, trigger, control, getFieldState } =
    useFormContext<CreatePostsFormValues>();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const { data: imageData, valid: isImageValidAfterValidation } =
    useImageValidation(file, index);

  const { mutateAsync: readyUploadAsync } = api.posts.upload.useMutation();

  const handleUpload = useCallback(async () => {
    setUploading(true);
    const { fields, id, url } = await readyUploadAsync({
      fileName: file.name,
      fileSize: file.size,
    });
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("file", file, file.name);
    await axios.request({
      method: "post",
      url,
      data: formData,
      onUploadProgress(progressEvent) {
        setProgress(
          Math.round((progressEvent.loaded * 100) / progressEvent.total!)
        );
      },
    });
    setUploading(false);
    setUploaded(true);
    setValue(`posts.${index}.uploadId`, id);
    setValue(`posts.${index}.status`, "uploaded");
  }, [index, file]);

  useEffect(() => {
    if (isImageValidAfterValidation) {
      handleUpload();
    }
  }, [isImageValidAfterValidation, handleUpload]);

  return (
    <div>
      <div className="w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={cn(
            "rounded-full bg-blue-600 p-0.5 text-center text-xs font-medium leading-none text-blue-100",
            {
              "bg-green-600": uploaded,
            }
          )}
          style={{ width: `${progress}%` }}
        >
          {uploaded ? "Uploaded" : `${progress}%`}
        </div>
      </div>
    </div>
  );
};

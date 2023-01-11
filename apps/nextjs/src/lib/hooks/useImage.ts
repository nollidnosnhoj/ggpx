import { useEffect, useMemo, useRef, useState } from "react";
import { useFileReader } from "./useFileReader";

export const useImage = (
  file: File,
  onLoad?: (image: HTMLImageElement) => void,
) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [base64, { loading: fileLoading, error: fileError }] = useFileReader(
    file,
    "readAsText",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
      onLoad?.(image);
    };
    image.onerror = (event, source, lineno, colno, imgError) => {
      setError(imgError ?? null);
    };
    image.src = base64 as string;
  }, [base64, onLoad]);

  const allError = useMemo<Error | null>(() => {
    return fileError || error;
  }, [fileError, error]);

  return [
    imageRef.current,
    {
      loading: fileLoading && loading,
      error: allError,
    },
  ] as const;
};

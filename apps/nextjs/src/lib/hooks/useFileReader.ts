import { useEffect, useState } from "react";

type FileReaderReadAsMethods = keyof Pick<
  FileReader,
  "readAsDataURL" | "readAsText" | "readAsArrayBuffer" | "readAsBinaryString"
>;

type UseFileReaderOptions = {
  onLoad?: (value: unknown) => void;
  onError?: (error: DOMException | null) => void;
};

export const useFileReader = (
  file: File,
  method: FileReaderReadAsMethods = "readAsText",
  options: UseFileReaderOptions = {}
) => {
  const [result, setResult] = useState<string | ArrayBuffer | null>(null);
  const [error, setError] = useState<DOMException | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file && result) setResult(null);
  }, [file, result]);

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadstart = () => setLoading(true);
    reader.onloadend = () => setLoading(false);
    reader.onerror = () => {
      setError(reader.error);
      options.onError?.(reader.error);
    };

    reader.onload = (event: ProgressEvent<FileReader>) => {
      setResult(event.target?.result ?? null);
      options.onLoad?.(event.target?.result ?? null);
    };

    reader[method](file);
  }, [file, method, options]);

  return [result, { loading, error }] as const;
};

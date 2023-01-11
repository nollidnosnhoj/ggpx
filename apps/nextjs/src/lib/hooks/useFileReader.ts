import { useEffect, useState } from "react";

type FileReaderReadAsMethods = keyof Pick<
  FileReader,
  "readAsDataURL" | "readAsText" | "readAsArrayBuffer" | "readAsBinaryString"
>;

export const useFileReader = (
  file: File,
  method: FileReaderReadAsMethods = "readAsText",
  onLoad?: (value: unknown) => void,
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
    reader.onerror = () => setError(reader.error);

    reader.onload = (event: ProgressEvent<FileReader>) => {
      setResult(event.target?.result ?? null);
      onLoad?.(event.target?.result ?? null);
    };

    reader[method](file);
  }, [file, method, onLoad]);

  return [result, { loading, error }] as const;
};

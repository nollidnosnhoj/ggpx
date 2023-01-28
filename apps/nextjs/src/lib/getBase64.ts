export const getBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);

    reader.onload = () => {
      resolve((reader.result as string) ?? "");
    };

    reader.readAsText(file);
  });
};

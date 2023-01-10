import mime from "mime-types";
import path from "path";

export const splitFileName = (fileName: string): [string, string] => {
  const parsed = path.parse(fileName);
  return [parsed.name, parsed.ext];
};

export const getContentType = (fileName: string) => {
  return mime.contentType(fileName);
};

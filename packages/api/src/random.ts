import { nanoid } from "nanoid";

export const getUniqueId = (length: number) => {
  return nanoid(length);
};

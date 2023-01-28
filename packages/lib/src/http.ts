import { z } from "zod";

export class FetchJsonError extends Error {
  constructor(public resposne: Response) {
    super("The response returned an error.");
  }
}

export const fetchJson = async <T = any>(
  input: RequestInfo | URL,
  schema?: z.ZodType<T>,
  init?: RequestInit
) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new FetchJsonError(response);
  }
  const json = await response.json();
  if (!schema) return json as T;
  return await schema.parseAsync(json);
};

import type { Readable } from "node:stream";

export const readBody = (stream: Readable) =>
  new Promise<string>((resolve) => {
    let raw = "";
    stream.on("data", (chunk) => {
      raw += chunk;
    });
    stream.on("end", () => resolve(raw));
  });

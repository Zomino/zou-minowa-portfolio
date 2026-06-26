import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";

import { readBody } from "./readBody";

describe("readBody", () => {
  it("concatenates stream chunks into a single string", async () => {
    const stream = Readable.from(["foo", "bar"]);

    expect(await readBody(stream)).toBe("foobar");
  });

  it("returns an empty string for an empty stream", async () => {
    const stream = Readable.from([]);

    expect(await readBody(stream)).toBe("");
  });
});

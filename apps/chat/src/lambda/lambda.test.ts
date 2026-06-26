import { describe, expect, it } from "vitest";

import { decodeBody } from "./lambda";

describe("decodeBody", () => {
  it("returns a plain body unchanged", () => {
    expect(decodeBody('{"messages":[]}', false)).toBe('{"messages":[]}');
  });

  it("base64 decodes when the flag is set", () => {
    const encoded = Buffer.from('{"messages":[]}', "utf8").toString("base64");

    expect(decodeBody(encoded, true)).toBe('{"messages":[]}');
  });

  it("returns null for a missing body", () => {
    expect(decodeBody(undefined, false)).toBeNull();
  });
});

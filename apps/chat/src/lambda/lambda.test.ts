import { describe, expect, it } from "vitest";

import { clientIdFrom, decodeBody, parseJson } from "./lambda";

describe("clientIdFrom", () => {
  it("uses the last x-forwarded-for entry, trimmed", () => {
    expect(clientIdFrom("1.1.1.1, 2.2.2.2 ", "10.0.0.1")).toBe("2.2.2.2");
  });

  it("falls back to the source ip when the header is absent", () => {
    expect(clientIdFrom(undefined, "10.0.0.1")).toBe("10.0.0.1");
  });
});

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

describe("parseJson", () => {
  it("parses a JSON body into an object", () => {
    expect(parseJson('{"body":{"messages":[]}}')).toEqual({
      body: { messages: [] },
    });
  });

  it("returns null for malformed JSON", () => {
    expect(parseJson("not json")).toBeNull();
  });

  it("returns null for a null body", () => {
    expect(parseJson(null)).toBeNull();
  });
});

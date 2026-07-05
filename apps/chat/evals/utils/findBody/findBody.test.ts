import { describe, expect, it } from "vitest";

import { findBody } from "./findBody";

const entries = [
  { slug: "painter-portfolio", body: "Strapi runs as the CMS backend." },
  { slug: "wedding-website", body: "Built with Gatsby." },
];

describe("findBody", () => {
  it("returns the body of the entry with the given slug", () => {
    expect(findBody(entries, "wedding-website")).toBe("Built with Gatsby.");
  });

  it("throws on an unknown slug", () => {
    expect(() => findBody(entries, "missing")).toThrowError(
      "Unknown slug missing.",
    );
  });
});

import { describe, expect, it } from "vitest";
import { buildRobotsTxt } from "./buildRobotsTxt";

describe("buildRobotsTxt", () => {
  it("allows all crawlers and points to the sitemap index from the site url", () => {
    const result = buildRobotsTxt(new URL("https://zouminowa.com"));

    expect(result).toContain("User-agent: *");
    expect(result).toContain("Allow: /");
    expect(result).toContain(
      "Sitemap: https://zouminowa.com/sitemap-index.xml",
    );
  });
});

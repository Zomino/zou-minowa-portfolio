import { describe, expect, it } from "vitest";

import { GET } from "../robots.txt";

describe("GET /robots.txt", () => {
  it("returns plain text allowing all crawlers with the sitemap index URL", async () => {
    const response = GET({ site: new URL("https://zouminowa.com") });

    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );

    const body = await response.text();

    expect(body).toContain("User-agent: *");
    expect(body).toContain("Allow: /");
    expect(body).toContain("Sitemap: https://zouminowa.com/sitemap-index.xml");
  });

  it("throws when the site is not configured", () => {
    expect(() => GET({ site: undefined })).toThrow(
      "Astro `site` must be configured",
    );
  });
});

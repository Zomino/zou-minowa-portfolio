import { describe, expect, it, vi } from "vitest";

vi.mock("astro:content", () => ({
  getCollection: vi.fn().mockResolvedValue([
    {
      id: "newer-project",
      data: {
        title: "Newer Project",
        description: "A newer one.",
        date: new Date("2025-01-01"),
      },
    },
    {
      id: "older-project",
      data: {
        title: "Older Project",
        description: "An older one.",
        date: new Date("2024-01-01"),
      },
    },
  ]),
}));

import { GET } from "../llms.txt";

describe("GET /llms.txt", () => {
  it("returns plain text with the index content and absolute project URLs", async () => {
    const response = await GET({ site: new URL("https://zouminowa.com") });

    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );

    const body = await response.text();

    expect(body).toContain("# Zou Minowa");
    expect(body).toContain(
      "- [Newer Project](https://zouminowa.com/projects/newer-project): A newer one.",
    );
    expect(body).toContain("## Optional");
  });

  it("throws when the site is not configured", async () => {
    await expect(GET({ site: undefined })).rejects.toThrow(
      "Astro `site` must be configured",
    );
  });
});

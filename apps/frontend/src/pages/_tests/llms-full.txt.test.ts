import { describe, expect, it, vi } from "vitest";

vi.mock("astro:content", () => ({
  getCollection: vi.fn((collection: string) =>
    collection === "journal"
      ? [
          {
            data: {
              title: "A Journal Entry",
              description: "A thought.",
              date: new Date("2025-06-01"),
            },
            body: "Journal body text.",
          },
        ]
      : [
          {
            data: {
              title: "Newer Project",
              description: "A newer one.",
              tags: ["Astro", "TypeScript"],
              link: "https://newer.example.com",
              github: "https://github.com/Zomino/newer",
              date: new Date("2025-01-01"),
            },
            body: "## Background\n\nNewer body text.",
          },
        ],
  ),
}));

import { GET } from "../llms-full.txt";

describe("GET /llms-full.txt", () => {
  it("returns plain text with the full project and journal content inline", async () => {
    const response = await GET();

    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );

    const body = await response.text();

    expect(body).toContain("# Zou Minowa");
    expect(body).toContain("## Newer Project");
    expect(body).toContain("Tech: Astro, TypeScript");
    expect(body).toContain("Newer body text.");
    expect(body).toContain("# Journal");
    expect(body).toContain("## A Journal Entry");
    expect(body).toContain("Journal body text.");
  });
});

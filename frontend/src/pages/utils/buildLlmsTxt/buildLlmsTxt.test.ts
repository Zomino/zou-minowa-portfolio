import { describe, expect, it } from "vitest";
import { buildLlmsTxt } from "./buildLlmsTxt";

const metadata = {
  siteTitle: "Zou Minowa",
  siteDescription: "London-based software engineer.",
  skills: ["TypeScript", "React"],
};

const projects = [
  {
    id: "older-project",
    data: {
      title: "Older Project",
      description: "An older one.",
      date: new Date("2024-01-01"),
    },
  },
  {
    id: "newer-project",
    data: {
      title: "Newer Project",
      description: "A newer one.",
      date: new Date("2025-01-01"),
    },
  },
];

const journal = [
  {
    id: "older-entry",
    data: {
      title: "Older Entry",
      description: "An older thought.",
      date: new Date("2024-06-01"),
    },
  },
  {
    id: "newer-entry",
    data: {
      title: "Newer Entry",
      description: "A newer thought.",
      date: new Date("2025-06-01"),
    },
  },
];

describe("buildLlmsTxt", () => {
  it("renders the H1, blockquote with skills, and an Optional section", () => {
    const result = buildLlmsTxt(
      new URL("https://zouminowa.com"),
      projects,
      journal,
      metadata,
    );

    expect(result).toContain("# Zou Minowa");
    expect(result).toContain(
      "> London-based software engineer. Core skills: TypeScript, React.",
    );
    expect(result).toContain("## About");
    expect(result).toContain(
      "- [Homepage](https://zouminowa.com/): Bio, skills overview, and featured projects.",
    );
    expect(result).toContain("## Optional");
    expect(result).toContain(
      "- [Full profile](https://zouminowa.com/llms-full.txt): Complete inline content including full project write-ups.",
    );
  });

  it("lists projects newest first with absolute URLs and descriptions", () => {
    const result = buildLlmsTxt(
      new URL("https://zouminowa.com"),
      projects,
      journal,
      metadata,
    );

    const newerIndex = result.indexOf("Newer Project");
    const olderIndex = result.indexOf("Older Project");

    expect(newerIndex).toBeGreaterThan(-1);
    expect(newerIndex).toBeLessThan(olderIndex);
    expect(result).toContain(
      "- [Newer Project](https://zouminowa.com/projects/newer-project): A newer one.",
    );
    expect(result).toContain(
      "- [All projects](https://zouminowa.com/projects): Full project listing.",
    );
  });

  it("lists journal entries newest first with absolute URLs and descriptions", () => {
    const result = buildLlmsTxt(
      new URL("https://zouminowa.com"),
      projects,
      journal,
      metadata,
    );

    expect(result).toContain("## Journal");
    expect(result).toContain(
      "- [All entries](https://zouminowa.com/journal): Full journal listing.",
    );
    expect(result).toContain(
      "- [Newer Entry](https://zouminowa.com/journal/newer-entry): A newer thought.",
    );

    const newerIndex = result.indexOf("Newer Entry");
    const olderIndex = result.indexOf("Older Entry");
    expect(newerIndex).toBeLessThan(olderIndex);
  });
});

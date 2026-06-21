import { describe, expect, it } from "vitest";
import { buildLlmsFullTxt } from "./buildLlmsFullTxt";

const metadata = {
  siteTitle: "Zou Minowa",
  siteDescription: "London-based software engineer.",
};

const projects = [
  {
    data: {
      title: "Older Project",
      description: "An older one.",
      tags: ["Gatsby"],
      link: "https://older.example.com",
      github: "https://github.com/Zomino/older",
      date: new Date("2024-01-01"),
    },
    body: "## Background\n\nOlder body text.",
  },
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
];

const journal = [
  {
    data: {
      title: "Older Entry",
      description: "An older thought.",
      date: new Date("2024-06-01"),
    },
    body: "Older entry body text.",
  },
  {
    data: {
      title: "Newer Entry",
      description: "A newer thought.",
      date: new Date("2025-06-01"),
    },
    body: "Newer entry body text.",
  },
];

describe("buildLlmsFullTxt", () => {
  it("renders the header blockquote and every project body newest first", () => {
    const result = buildLlmsFullTxt(projects, journal, metadata);

    expect(result).toContain("# Zou Minowa");
    expect(result).toContain("> London-based software engineer.");
    expect(result).toContain("## Newer Project");
    expect(result).toContain("Tech: Astro, TypeScript");
    expect(result).toContain("Live: https://newer.example.com");
    expect(result).toContain("Code: https://github.com/Zomino/newer");
    expect(result).toContain("Newer body text.");
    expect(result).toContain("Older body text.");

    const newerIndex = result.indexOf("## Newer Project");
    const olderIndex = result.indexOf("## Older Project");
    expect(newerIndex).toBeLessThan(olderIndex);
  });

  it("renders a Journal section with every entry body newest first", () => {
    const result = buildLlmsFullTxt(projects, journal, metadata);

    expect(result).toContain("# Journal");
    expect(result).toContain("## Newer Entry");
    expect(result).toContain("Newer entry body text.");
    expect(result).toContain("Older entry body text.");

    const newerIndex = result.indexOf("## Newer Entry");
    const olderIndex = result.indexOf("## Older Entry");
    expect(newerIndex).toBeLessThan(olderIndex);
  });
});

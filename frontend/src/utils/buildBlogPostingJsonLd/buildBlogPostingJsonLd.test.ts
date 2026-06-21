import { describe, expect, it } from "vitest";
import { buildBlogPostingJsonLd } from "./buildBlogPostingJsonLd";

const entry = {
  id: "test-coverage-target",
  data: {
    title: "Why I Think Aiming for a Test Coverage Target is a Good Thing",
    description: "A defence of strict test coverage requirements.",
    tags: ["Unit testing", "TDD"],
    date: new Date("2026-06-20"),
  },
};

describe("buildBlogPostingJsonLd", () => {
  it("builds a BlogPosting schema from journal entry frontmatter", () => {
    const result = buildBlogPostingJsonLd(
      "https://zouminowa.com/",
      entry,
      "Zou Minowa",
    );

    expect(result).toEqual({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "Why I Think Aiming for a Test Coverage Target is a Good Thing",
      description: "A defence of strict test coverage requirements.",
      url: "https://zouminowa.com/journal/test-coverage-target",
      datePublished: "2026-06-20",
      keywords: ["Unit testing", "TDD"],
      inLanguage: "en",
      author: {
        "@type": "Person",
        name: "Zou Minowa",
        url: "https://zouminowa.com/",
      },
    });
  });
});

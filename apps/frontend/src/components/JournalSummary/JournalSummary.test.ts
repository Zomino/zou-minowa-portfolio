import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import JournalSummary from "./JournalSummary.astro";

describe("JournalSummary", () => {
  it("renders the entry title, summary and date", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(JournalSummary, {
      props: {
        title: "On building portfolios",
        description: "Why I rebuilt this site from scratch.",
        date: new Date("2026-06-20"),
        tags: ["engineering", "thoughts"],
        slug: "on-building-portfolios",
      },
    });

    expect(html).toContain("On building portfolios");
    expect(html).toContain("Why I rebuilt this site from scratch.");
    expect(html).toContain("Jun");
    expect(html).toContain("2026");
  });

  it("lifts on hover with a reduced motion guard", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(JournalSummary, {
      props: {
        title: "On building portfolios",
        description: "Why I rebuilt this site from scratch.",
        date: new Date("2026-06-20"),
        tags: ["engineering", "thoughts"],
        slug: "on-building-portfolios",
      },
    });

    expect(html).toContain("hover:-translate-y-0.5");
    expect(html).toContain("motion-reduce:transition-none");
  });

  it("links to the entry page", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(JournalSummary, {
      props: {
        title: "On building portfolios",
        description: "Why I rebuilt this site from scratch.",
        date: new Date("2026-06-20"),
        tags: [],
        slug: "on-building-portfolios",
      },
    });

    expect(html).toContain('href="/journal/on-building-portfolios"');
  });

  it("renders each tag as a badge", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(JournalSummary, {
      props: {
        title: "On building portfolios",
        description: "Why I rebuilt this site from scratch.",
        date: new Date("2026-06-20"),
        tags: ["engineering", "thoughts"],
        slug: "on-building-portfolios",
      },
    });

    expect(html).toContain("engineering");
    expect(html).toContain("thoughts");
  });
});

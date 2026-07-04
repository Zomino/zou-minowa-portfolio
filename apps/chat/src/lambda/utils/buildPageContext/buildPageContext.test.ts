import { describe, expect, it } from "vitest";

import { buildPageContext } from "./buildPageContext";

const portfolio = {
  name: "Zou Minowa",
  headline: "Software engineer building maintainable products.",
  projects: [
    {
      slug: "daisuke-minowa-website",
      title: "Painter Portfolio",
      description: "A portfolio website for my father, a painter.",
      tags: ["Next.js", "Strapi"],
      body: "Strapi runs as the CMS backend.",
    },
  ],
  journal: [
    {
      slug: "migrating-vercel-to-aws",
      title: "Migrating from Vercel to AWS in a Weekend",
      description: "Why the speed was not the point.",
      tags: ["AWS", "Replatforming"],
      date: "2026-06-25",
      body: "I recently migrated this portfolio site off Vercel.",
    },
  ],
};

describe("buildPageContext", () => {
  it("names the project when the page is a project page", () => {
    const context = buildPageContext(
      portfolio,
      "/projects/daisuke-minowa-website",
    );

    expect(context).toContain("/projects/daisuke-minowa-website");
    expect(context).toContain('the project "Painter Portfolio"');
  });

  it("names the journal entry when the page is a journal page", () => {
    const context = buildPageContext(
      portfolio,
      "/journal/migrating-vercel-to-aws/",
    );

    expect(context).toContain("/journal/migrating-vercel-to-aws");
    expect(context).toContain(
      'the journal entry "Migrating from Vercel to AWS in a Weekend"',
    );
  });

  it("states just the path for other pages", () => {
    expect(buildPageContext(portfolio, "/projects")).toBe(
      "The visitor is currently on the page /projects.",
    );
    expect(buildPageContext(portfolio, "/")).toBe(
      "The visitor is currently on the page /.",
    );
  });

  it("returns an empty string without a pageSlug", () => {
    expect(buildPageContext(portfolio)).toBe("");
    expect(buildPageContext(portfolio, "")).toBe("");
  });

  it("returns an empty string for an oversized pageSlug", () => {
    expect(buildPageContext(portfolio, `/${"a".repeat(300)}`)).toBe("");
  });
});

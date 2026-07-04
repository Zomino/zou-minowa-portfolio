import { describe, expect, it } from "vitest";

import { buildPortfolio } from "./generate.ts";

describe("buildPortfolio", () => {
  it("assembles identity, projects and journal from raw collections", () => {
    const portfolio = buildPortfolio({
      metadata: { siteTitle: "Zou Minowa", siteDescription: "London-based." },
      projects: [
        {
          slug: "portfolio",
          data: {
            title: "Portfolio",
            description: "A site",
            tags: ["astro"],
            link: "https://example.com",
            github: "https://github.com/x/y",
          },
          content: "\n  Project body  \n",
        },
      ],
      journal: [
        {
          slug: "post",
          data: {
            title: "Post",
            description: "Hello",
            date: new Date("2026-07-03T00:00:00Z"),
          },
          content: "  Journal body  ",
        },
      ],
    });

    expect(portfolio.name).toBe("Zou Minowa");
    expect(portfolio.headline).toBe("London-based.");
    expect(portfolio.projects).toEqual([
      {
        slug: "portfolio",
        title: "Portfolio",
        description: "A site",
        tags: ["astro"],
        body: "Project body",
        link: "https://example.com",
        github: "https://github.com/x/y",
      },
    ]);
    expect(portfolio.journal).toEqual([
      {
        slug: "post",
        title: "Post",
        description: "Hello",
        tags: [],
        date: "2026-07-03",
        body: "Journal body",
      },
    ]);
  });

  it("omits optional project links and defaults tags", () => {
    const portfolio = buildPortfolio({
      metadata: { siteTitle: "Zou Minowa", siteDescription: "x" },
      projects: [
        { slug: "t", data: { title: "T", description: "D" }, content: "B" },
      ],
      journal: [],
    });

    const [project] = portfolio.projects;

    expect(project?.tags).toEqual([]);
    expect(project).not.toHaveProperty("link");
    expect(project).not.toHaveProperty("github");
  });

  it("passes through a string journal date unchanged", () => {
    const portfolio = buildPortfolio({
      metadata: { siteTitle: "Zou Minowa", siteDescription: "x" },
      projects: [],
      journal: [
        {
          slug: "t",
          data: { title: "T", description: "D", date: "2026-01-01" },
          content: "B",
        },
      ],
    });

    expect(portfolio.journal[0]?.date).toBe("2026-01-01");
  });

  it("handles empty collections", () => {
    const portfolio = buildPortfolio({
      metadata: { siteTitle: "Zou Minowa", siteDescription: "x" },
      projects: [],
      journal: [],
    });

    expect(portfolio.projects).toEqual([]);
    expect(portfolio.journal).toEqual([]);
  });
});

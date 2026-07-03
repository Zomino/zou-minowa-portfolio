import { describe, expect, it } from "vitest";

import { buildSystemPrompt } from "./buildSystemPrompt";

const portfolio = {
  name: "Zou Minowa",
  headline: "Software engineer building maintainable products.",
  projects: [
    {
      title: "Painter Portfolio",
      description: "A portfolio website for my father, a painter.",
      tags: ["Next.js", "Strapi"],
      link: "https://www.daisukeminowa.com/",
      github: "https://github.com/Zomino/daisuke-minowa-website",
      body: "Strapi runs as the CMS backend with a least-privilege account.",
    },
    {
      title: "This Portfolio",
      description: "The site you are reading right now.",
      tags: ["Astro", "Tailwind CSS"],
      body: "An Astro and Tailwind site hosted on AWS.",
    },
  ],
  journal: [
    {
      title: "Migrating from Vercel to AWS in a Weekend",
      description: "Why the speed was not the point.",
      tags: ["AWS", "Replatforming"],
      date: "2026-06-25",
      body: "I recently migrated this portfolio site off Vercel hosting and onto AWS.",
    },
  ],
};

describe("buildSystemPrompt", () => {
  it("includes the name and headline", () => {
    const prompt = buildSystemPrompt(portfolio);

    expect(prompt).toContain("Zou Minowa");
    expect(prompt).toContain(
      "Software engineer building maintainable products.",
    );
  });

  it("includes every project title, description, tags and body", () => {
    const prompt = buildSystemPrompt(portfolio);

    for (const project of portfolio.projects) {
      expect(prompt).toContain(project.title);
      expect(prompt).toContain(project.description);
      expect(prompt).toContain(project.body);
      for (const tag of project.tags) {
        expect(prompt).toContain(tag);
      }
    }
  });

  it("includes project links and repositories when present", () => {
    const prompt = buildSystemPrompt(portfolio);

    expect(prompt).toContain("https://www.daisukeminowa.com/");
    expect(prompt).toContain(
      "https://github.com/Zomino/daisuke-minowa-website",
    );
  });

  it("includes every journal entry title, date and body", () => {
    const prompt = buildSystemPrompt(portfolio);

    for (const entry of portfolio.journal) {
      expect(prompt).toContain(entry.title);
      expect(prompt).toContain(entry.date);
      expect(prompt).toContain(entry.body);
    }
  });

  it("instructs the model to answer only from the portfolio", () => {
    const prompt = buildSystemPrompt(portfolio);

    expect(prompt).toMatch(/only/i);
  });
});

import { describe, expect, it } from "vitest";

import { buildSystemPrompt } from "./buildSystemPrompt";

const portfolio = {
  name: "Zou Minowa",
  headline: "Software engineer building maintainable products.",
  projects: [
    { name: "Portfolio site", summary: "Astro and Tailwind site on AWS." },
    { name: "Chat backend", summary: "Bedrock Lambda answering portfolio questions." },
  ],
};

describe("buildSystemPrompt", () => {
  it("includes the name and headline", () => {
    const prompt = buildSystemPrompt(portfolio);

    expect(prompt).toContain("Zou Minowa");
    expect(prompt).toContain("Software engineer building maintainable products.");
  });

  it("includes every project name and summary", () => {
    const prompt = buildSystemPrompt(portfolio);

    for (const project of portfolio.projects) {
      expect(prompt).toContain(project.name);
      expect(prompt).toContain(project.summary);
    }
  });

  it("instructs the model to answer only from the portfolio", () => {
    const prompt = buildSystemPrompt(portfolio);

    expect(prompt).toMatch(/only/i);
  });
});

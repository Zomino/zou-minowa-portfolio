import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it, vi } from "vitest";

vi.mock("astro:content", () => ({
  getCollection: vi.fn().mockResolvedValue([
    { data: { tags: ["Astro", "Tailwind", "Go"] } },
    { data: { tags: ["Astro", "Tailwind", "Rust"] } },
    {
      data: {
        tags: [
          "Astro",
          "ESLint",
          "Vercel",
          "Vitest",
          "Python",
          "Java",
          "Svelte",
        ],
      },
    },
  ]),
}));

import SkillsSection from "./SkillsSection.astro";

const render = async () => {
  const container = await AstroContainer.create();
  return container.renderToString(SkillsSection);
};

describe("SkillsSection", () => {
  it("renders the skills heading", async () => {
    const html = await render();

    expect(html).toContain("Core skills");
  });

  it("renders all core skill badges", async () => {
    const html = await render();

    expect(html).toContain("TypeScript");
    expect(html).toContain("React");
    expect(html).toContain("Node");
    expect(html).toContain("MongoDB");
    expect(html).toContain("AWS");
    expect(html).toContain("Terraform");
  });

  it("renders extended skills from project tags, most used first", async () => {
    const html = await render();

    expect(html.indexOf("Astro")).toBeLessThan(html.indexOf("Tailwind"));
    expect(html.indexOf("Tailwind")).toBeLessThan(html.indexOf("Go"));
  });

  it("limits extended skills to the four most used tags", async () => {
    const html = await render();

    expect(html).toContain("Astro");
    expect(html).toContain("Tailwind");
    expect(html).toContain("Go");
    expect(html).toContain("Rust");
    expect(html).not.toContain("Vercel");
    expect(html).not.toContain("Python");
  });
});

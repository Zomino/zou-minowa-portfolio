import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it, vi } from "vitest";

vi.mock("virtual:astro-icon", () => ({
  default: {
    local: {
      prefix: "local",
      icons: {
        github: { body: '<rect width="16" height="16"/>' },
        linkedin: { body: '<rect width="16" height="16"/>' },
        mail: { body: '<rect width="16" height="16"/>' },
      },
    },
  },
  config: { include: {} },
}));

import Hero from "./Hero.astro";

describe("Hero", () => {
  it("renders the hero content", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Hero);

    expect(html).toContain("Fullstack software engineer");
    expect(html).toContain("Zou");
    expect(html).toContain("Minowa");
    expect(html).toContain("London-based. Generalist. AI enthusiast.");
  });

  it("includes the brand target data attribute", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Hero);

    expect(html).toContain("data-brand-target");
  });
});

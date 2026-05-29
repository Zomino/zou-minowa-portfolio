import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

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

  it("renders all skill badges", async () => {
    const html = await render();

    expect(html).toContain("TypeScript");
    expect(html).toContain("React");
    expect(html).toContain("Node");
    expect(html).toContain("MongoDB");
    expect(html).toContain("AWS");
    expect(html).toContain("Terraform");
  });
});

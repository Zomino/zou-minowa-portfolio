import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import ProjectTagFilter from "./ProjectTagFilter.astro";

describe("ProjectTagFilter", () => {
  it("renders the filter panel", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectTagFilter, {
      props: { tags: ["React", "TypeScript"] },
    });

    expect(html).toContain("data-tag-filter-panel");
  });

  it("renders All and one button per tag", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectTagFilter, {
      props: { tags: ["React", "TypeScript", "Node"] },
    });

    expect(html).toContain("All");
    expect(html).toContain("React");
    expect(html).toContain("TypeScript");
    expect(html).toContain("Node");
  });

  it("sets data-tag-filter-tag attributes on each button", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectTagFilter, {
      props: { tags: ["Astro", "Tailwind"] },
    });

    expect(html).toContain('data-tag-filter-tag="all"');
    expect(html).toContain('data-tag-filter-tag="Astro"');
    expect(html).toContain('data-tag-filter-tag="Tailwind"');
  });

  it("is hidden by default", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectTagFilter, {
      props: { tags: ["React"] },
    });

    expect(html).toContain("hidden");
  });
});

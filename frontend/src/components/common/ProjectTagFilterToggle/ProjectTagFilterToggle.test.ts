import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import ProjectTagFilterToggle from "./ProjectTagFilterToggle.astro";

describe("ProjectTagFilterToggle", () => {
  it("renders the toggle button with label", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectTagFilterToggle);

    expect(html).toContain("Filter by tag");
    expect(html).toContain("data-tag-filter-toggle");
  });

  it("renders the count badge element hidden by default", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectTagFilterToggle);

    expect(html).toContain("data-tag-filter-count");
    expect(html).toContain('class="hidden');
  });

  it("renders the chevron icon", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectTagFilterToggle);

    expect(html).toContain("data-tag-filter-chevron");
  });

  it("sets aria-expanded to false by default", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectTagFilterToggle);

    expect(html).toContain('aria-expanded="false"');
  });
});

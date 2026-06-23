import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import Burger from "./Burger.astro";

describe("Burger", () => {
  it("renders a span with three line spans", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Burger);

    const lineCount = (html.match(/<span class="absolute left-0/g) || [])
      .length;

    expect(lineCount).toBe(3);
  });

  it("hides the burger from assistive technology", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Burger);

    expect(html).toContain('aria-hidden="true"');
  });

  it("includes group-data-open classes for animation", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Burger);

    expect(html).toContain("group-data-open:translate-y-1.5");
    expect(html).toContain("group-data-open:rotate-45");
    expect(html).toContain("group-data-open:opacity-0");
    expect(html).toContain("group-data-open:-translate-y-1.5");
    expect(html).toContain("group-data-open:-rotate-45");
  });
});

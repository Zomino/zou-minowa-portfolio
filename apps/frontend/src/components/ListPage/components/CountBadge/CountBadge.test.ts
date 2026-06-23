import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import CountBadge from "./CountBadge.astro";

describe("CountBadge", () => {
  it("renders a span hidden by default", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CountBadge);

    expect(html).toContain("<span");
    expect(html).toMatch(/class="[^"]*\bhidden\b/);
  });

  it("forwards arbitrary attributes onto the span", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CountBadge, {
      props: { "data-list-page-count": true },
    });

    expect(html).toContain("data-list-page-count");
  });

  it("renders slotted content", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CountBadge, {
      slots: { default: "3" },
    });

    expect(html).toContain("3");
  });
});

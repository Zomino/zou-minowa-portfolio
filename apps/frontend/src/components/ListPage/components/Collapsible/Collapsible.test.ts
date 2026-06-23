import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import Collapsible from "./Collapsible.astro";

describe("Collapsible", () => {
  it("renders collapsed by default", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Collapsible);

    expect(html).toContain("grid-rows-[0fr]");
    expect(html).toContain("overflow-hidden");
  });

  it("forwards arbitrary attributes onto the outer element", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Collapsible, {
      props: { "data-list-page-panel": true },
    });

    expect(html).toContain("data-list-page-panel");
  });

  it("renders slotted content", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Collapsible, {
      slots: { default: "<p>panel content</p>" },
    });

    expect(html).toContain("panel content");
  });
});

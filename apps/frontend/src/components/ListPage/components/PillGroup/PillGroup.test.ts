import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import PillGroup from "./PillGroup.astro";

describe("PillGroup", () => {
  it("renders a faded flex-wrap group by default", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PillGroup);

    expect(html).toContain("flex-wrap");
    expect(html).toMatch(/class="[^"]*\bopacity-0\b/);
  });

  it("merges a passed class with the base styles", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PillGroup, {
      props: { class: "mt-3" },
    });

    expect(html).toContain("flex-wrap");
    expect(html).toContain("mt-3");
  });

  it("forwards arbitrary attributes onto the group", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PillGroup, {
      props: { "data-list-page-tags": true },
    });

    expect(html).toContain("data-list-page-tags");
  });

  it("renders slotted content", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PillGroup, {
      slots: { default: "<button>All</button>" },
    });

    expect(html).toContain("All");
  });
});

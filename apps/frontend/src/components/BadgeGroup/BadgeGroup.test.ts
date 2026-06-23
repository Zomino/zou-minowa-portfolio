import { describe, expect, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";

import BadgeGroup from "./BadgeGroup.astro";

describe("BadgeGroup", () => {
  it("renders a wrapper with default layout classes", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BadgeGroup, {
      slots: { default: "Content" },
    });

    expect(html).toContain("flex");
    expect(html).toContain("flex-wrap");
    expect(html).toContain("items-center");
    expect(html).toContain("gap-2");
    expect(html).toContain("flex-row");
  });

  it("merges custom classes", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BadgeGroup, {
      props: { class: "mt-6" },
      slots: { default: "Content" },
    });

    expect(html).toContain("mt-6");
  });
});

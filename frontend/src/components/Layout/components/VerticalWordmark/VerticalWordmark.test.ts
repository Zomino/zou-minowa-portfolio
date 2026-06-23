import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import VerticalWordmark from "./VerticalWordmark.astro";

describe("VerticalWordmark", () => {
  it("renders the provided text", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VerticalWordmark, {
      slots: { default: "Test" },
    });

    expect(html).toContain("Test");
  });

  it("merges custom classes", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(VerticalWordmark, {
      props: { class: "opacity-40" },
      slots: { default: "Test" },
    });

    expect(html).toContain("opacity-40");
  });
});

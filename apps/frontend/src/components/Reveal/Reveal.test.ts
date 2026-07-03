import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import Reveal from "./Reveal.astro";

describe("Reveal", () => {
  it("renders a div by default", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Reveal, {
      slots: { default: "<p>Content</p>" },
    });

    expect(html).toContain("<div");
    expect(html).toContain("<p>Content</p>");
  });

  it("applies a passed class", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Reveal, {
      props: { class: "h-full" },
      slots: { default: "<p>Content</p>" },
    });

    expect(html).toContain("h-full");
  });

  it("marks itself for the reveal script", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Reveal, {
      slots: { default: "<p>Content</p>" },
    });

    expect(html).toContain("data-reveal");
  });
});

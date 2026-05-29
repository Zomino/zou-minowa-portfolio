import { describe, expect, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";

import Section from "./Section.astro";

describe("Section", () => {
  it("renders the heading text", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Section, {
      props: { heading: "Section heading" },
      slots: { default: "<p>Content</p>" },
    });

    expect(html).toContain("Section heading");
  });

  it("renders slot content", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Section, {
      props: { heading: "Section heading" },
      slots: { default: "<p>Content</p>" },
    });

    expect(html).toContain("<p>Content</p>");
  });

  it("applies the default heading spacing", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Section, {
      props: { heading: "Section heading" },
      slots: { default: "<p>Content</p>" },
    });

    expect(html).toContain("heading-2-spacing");
  });

  it("applies spacing matching the heading variant", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Section, {
      props: { heading: "Section heading", headingVariant: 3 },
      slots: { default: "<p>Content</p>" },
    });

    expect(html).toContain("heading-3-spacing");
  });

  it("merges custom classes onto the section element", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Section, {
      props: { heading: "Section heading", class: "mt-10" },
      slots: { default: "<p>Content</p>" },
    });

    expect(html).toContain("mt-10");
  });
});

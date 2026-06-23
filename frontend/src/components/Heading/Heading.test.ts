import { describe, expect, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Heading from "./Heading.astro";

describe("Heading", () => {
  it("renders the correct tag for the level", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Heading, {
      props: { level: 2 },
      slots: { default: "Title" },
    });

    expect(html).toContain("<h2");
  });

  it("applies heading-1 styles by default", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Heading, {
      props: { level: 1 },
      slots: { default: "Title" },
    });

    expect(html).toContain("heading-1");
  });

  it("applies styles matching the level when no variant is provided", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Heading, {
      props: { level: 2 },
      slots: { default: "Title" },
    });

    expect(html).toContain("heading-2");
  });

  it("applies styles matching the variant when provided", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Heading, {
      props: { level: 2, variant: 3 },
      slots: { default: "Title" },
    });

    expect(html).toContain("heading-3");
  });

  it("does not apply spacing classes by default", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Heading, {
      props: { level: 1 },
      slots: { default: "Title" },
    });

    expect(html).not.toContain("heading-1-spacing");
  });

  it("applies spacing class matching the variant when spacing is enabled", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Heading, {
      props: { level: 2, spacing: true },
      slots: { default: "Title" },
    });

    expect(html).toContain("heading-2-spacing");
  });

  it("applies spacing class matching the variant override", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Heading, {
      props: { level: 1, variant: 3, spacing: true },
      slots: { default: "Title" },
    });

    expect(html).toContain("heading-3-spacing");
    expect(html).not.toContain("heading-1-spacing");
  });
});

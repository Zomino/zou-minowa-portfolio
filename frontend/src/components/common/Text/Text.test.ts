import { describe, expect, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Text from "./Text.astro";

describe("Text", () => {
  it("renders a paragraph by default", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Text, {
      slots: { default: "Body text" },
    });

    expect(html).toContain("<p");
  });

  it("falls back to body styles when variant is missing", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Text, {
      slots: { default: "Fallback" },
    });

    expect(html).toContain("text-body");
  });

  it("renders a span for the small variant", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Text, {
      props: { variant: "small" },
      slots: { default: "Small text" },
    });

    expect(html).toContain("<span");
  });

  it("applies small styles", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Text, {
      props: { variant: "small" },
      slots: { default: "Small text" },
    });

    expect(html).toContain("text-small");
  });

  it("renders a strong tag for the strong variant", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Text, {
      props: { variant: "strong" },
      slots: { default: "Strong text" },
    });

    expect(html).toContain("<strong");
  });

  it("applies strong styles", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Text, {
      props: { variant: "strong" },
      slots: { default: "Strong text" },
    });

    expect(html).toContain("text-strong");
  });

  it("renders a span for the eyebrow variant", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Text, {
      props: { variant: "eyebrow" },
      slots: { default: "Eyebrow text" },
    });

    expect(html).toContain("<span");
  });

  it("applies eyebrow styles", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Text, {
      props: { variant: "eyebrow" },
      slots: { default: "Eyebrow text" },
    });

    expect(html).toContain("uppercase");
    expect(html).toContain("tracking-wider");
  });

  it("does not apply spacing by default", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Text, {
      slots: { default: "Body text" },
    });

    expect(html).not.toContain("text-body-spacing");
  });

  it("applies spacing when enabled", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Text, {
      props: { spacing: true },
      slots: { default: "Body text" },
    });

    expect(html).toContain("text-body-spacing");
  });

  it("merges custom classes", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Text, {
      props: { variant: "eyebrow", class: "text-red-500" },
      slots: { default: "Eyebrow text" },
    });

    expect(html).toContain("text-red-500");
  });
});

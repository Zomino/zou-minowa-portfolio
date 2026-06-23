import { describe, expect, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import EyebrowText from "./EyebrowText.astro";

describe("EyebrowText", () => {
  it("renders a span", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EyebrowText, {
      slots: { default: "Eyebrow text" },
    });

    expect(html).toContain("<span");
  });

  it("applies the eyebrow styles", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EyebrowText, {
      slots: { default: "Eyebrow text" },
    });

    expect(html).toContain("uppercase");
    expect(html).toContain("tracking-wider");
  });

  it("uses text-xs for the default variant", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EyebrowText, {
      slots: { default: "Eyebrow text" },
    });

    expect(html).toContain("text-xs");
  });

  it("uses text-2xs for the small variant", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EyebrowText, {
      props: { variant: "small" },
      slots: { default: "Eyebrow text" },
    });

    expect(html).toContain("text-2xs");
  });

  it("merges custom classes", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(EyebrowText, {
      props: { class: "text-red-500" },
      slots: { default: "Eyebrow text" },
    });

    expect(html).toContain("text-red-500");
  });
});

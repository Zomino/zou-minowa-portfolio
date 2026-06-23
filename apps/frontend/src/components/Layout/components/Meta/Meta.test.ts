import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import Meta from "./Meta.astro";

const defaultProps = {
  documentTitle: "Test Page | Zou Minowa",
  description: "A test description",
  canonicalUrl: "https://example.com/test",
  siteName: "Zou Minowa",
};

describe("Meta", () => {
  it("renders charset and viewport meta tags", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Meta, { props: defaultProps });

    expect(html).toContain('charset="utf-8"');
    expect(html).toContain('name="viewport"');
    expect(html).toContain("width=device-width, initial-scale=1");
  });

  it("renders description meta tag", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Meta, { props: defaultProps });

    expect(html).toContain('name="description"');
    expect(html).toContain("A test description");
  });

  it("renders author meta tag with site name", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Meta, { props: defaultProps });

    expect(html).toContain('name="author"');
    expect(html).toContain("Zou Minowa");
  });

  it("renders robots meta tag", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Meta, { props: defaultProps });

    expect(html).toContain('name="robots"');
    expect(html).toContain("index, follow");
  });

  it("renders theme-color meta tag", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Meta, { props: defaultProps });

    expect(html).toContain('name="theme-color"');
  });

  it("renders generator meta tag", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Meta, { props: defaultProps });

    expect(html).toContain('name="generator"');
    expect(html).toContain("Astro");
  });

  it("renders Open Graph meta tags", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Meta, { props: defaultProps });

    expect(html).toContain('property="og:title"');
    expect(html).toContain("Test Page | Zou Minowa");
    expect(html).toContain('property="og:description"');
    expect(html).toContain('property="og:type"');
    expect(html).toContain("website");
    expect(html).toContain('property="og:url"');
    expect(html).toContain("https://example.com/test");
    expect(html).toContain('property="og:site_name"');
    expect(html).toContain('property="og:locale"');
    expect(html).toContain("en");
  });

  it("renders og:image when image prop is provided", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Meta, {
      props: { ...defaultProps, image: "https://example.com/image.png" },
    });

    expect(html).toContain('property="og:image"');
    expect(html).toContain("https://example.com/image.png");
  });

  it("does not render og:image when image prop is not provided", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Meta, { props: defaultProps });

    expect(html).not.toContain('property="og:image"');
  });

  it("renders twitter:card as summary_large_image when image is provided", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Meta, {
      props: { ...defaultProps, image: "https://example.com/image.png" },
    });

    expect(html).toContain("summary_large_image");
  });

  it("renders twitter:card as summary when no image is provided", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Meta, { props: defaultProps });

    expect(html).toContain('content="summary"');
    expect(html).not.toContain("summary_large_image");
  });

  it("renders Twitter meta tags", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Meta, { props: defaultProps });

    expect(html).toContain('name="twitter:title"');
    expect(html).toContain('name="twitter:description"');
  });

  it("renders twitter:image when twitterImage prop is provided", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Meta, {
      props: {
        ...defaultProps,
        twitterImage: "https://example.com/twitter.png",
      },
    });

    expect(html).toContain('name="twitter:image"');
    expect(html).toContain("https://example.com/twitter.png");
  });

  it("does not render twitter:image when twitterImage prop is not provided", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Meta, { props: defaultProps });

    expect(html).not.toContain('name="twitter:image"');
  });
});

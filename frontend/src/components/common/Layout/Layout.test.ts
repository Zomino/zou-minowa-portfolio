import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import Layout from "./Layout.astro";

const createContainer = () => AstroContainer.create();

describe("Layout", () => {
  it("renders the site title when no pageTitle is provided", async () => {
    const container = await createContainer();
    const html = await container.renderToString(Layout);

    expect(html).toContain("<title>Zou Minowa</title>");
  });

  it("renders the document title with page title and site title", async () => {
    const container = await createContainer();
    const html = await container.renderToString(Layout, {
      props: { pageTitle: "About" },
    });

    expect(html).toContain("<title>About | Zou Minowa</title>");
  });

  it("renders the default description when none is provided", async () => {
    const container = await createContainer();
    const html = await container.renderToString(Layout);

    expect(html).toContain("London-based software engineer");
  });

  it("renders a custom description when provided", async () => {
    const container = await createContainer();
    const html = await container.renderToString(Layout, {
      props: { description: "Custom description" },
    });

    expect(html).toContain("Custom description");
  });

  it("includes canonical, sitemap, and favicon links", async () => {
    const container = await createContainer();
    const html = await container.renderToString(Layout);

    expect(html).toContain('rel="canonical"');
    expect(html).toContain('rel="sitemap"');
    expect(html).toContain('rel="icon"');
  });

  it("renders the footer with copyright", async () => {
    const container = await createContainer();
    const html = await container.renderToString(Layout);

    expect(html).toContain("©");
    expect(html).toContain("Zou Minowa");
  });

  it("renders the main content slot", async () => {
    const container = await createContainer();
    const html = await container.renderToString(Layout, {
      slots: { default: "<p>Test content</p>" },
    });

    expect(html).toContain("<p>Test content</p>");
  });
});

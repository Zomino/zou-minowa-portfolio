import { describe, expect, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Link from "./Link.astro";

describe("Link", () => {
  it("renders an anchor with the provided href", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Link, {
      props: { href: "/about" },
      slots: { default: "About" },
    });

    expect(html).toContain("<a");
    expect(html).toContain('href="/about"');
  });

  it("renders slot content", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Link, {
      props: { href: "/about" },
      slots: { default: "About" },
    });

    expect(html).toContain("About");
  });

  it("applies the default link class", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Link, {
      props: { href: "/projects" },
      slots: { default: "Projects" },
    });

    expect(html).toContain('class="link"');
  });

  it("merges custom classes with defaults", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Link, {
      props: { href: "/projects", class: "text-slate-700" },
      slots: { default: "Projects" },
    });

    expect(html).toContain("link");
    expect(html).toContain("text-slate-700");
  });

  it("forwards extra attributes", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Link, {
      props: {
        href: "/",
        "data-test": "link",
        "aria-hidden": "true",
        tabindex: "-1",
      },
      slots: { default: "Home" },
    });

    expect(html).toContain('data-test="link"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('tabindex="-1"');
  });

  it("defaults to same-tab behavior", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Link, {
      props: { href: "/contact" },
      slots: { default: "Contact" },
    });

    expect(html).not.toContain('target="_blank"');
    expect(html).not.toContain('rel="noreferrer noopener"');
  });

  it("adds target and rel when opening in a new tab", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Link, {
      props: { href: "https://example.com", openNewTab: true },
      slots: { default: "External" },
    });

    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer noopener"');
  });
});

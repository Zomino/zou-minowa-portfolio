import { describe, expect, it, vi } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";

vi.mock("virtual:astro-icon", () => ({
  default: {
    local: {
      prefix: "local",
      icons: { github: { body: '<rect width="16" height="16"/>' } },
    },
  },
  config: { include: {} },
}));

import IconLink from "./IconLink.astro";

describe("IconLink", () => {
  it("renders the provided href and aria-label", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(IconLink, {
      props: {
        href: "https://example.com",
        icon: "github",
        ariaLabel: "GitHub",
      },
    });

    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('aria-label="GitHub"');
  });

  it("opens in a new tab by default", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(IconLink, {
      props: {
        href: "https://example.com",
        icon: "github",
        ariaLabel: "GitHub",
      },
    });

    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer noopener"');
  });

  it("stays in the same tab when openNewTab is false", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(IconLink, {
      props: {
        href: "https://example.com",
        icon: "github",
        ariaLabel: "GitHub",
        openNewTab: false,
      },
    });

    expect(html).not.toContain('target="_blank"');
    expect(html).not.toContain('rel="noreferrer noopener"');
  });

  it("merges custom classes with the base layout classes", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(IconLink, {
      props: {
        href: "https://example.com",
        icon: "github",
        ariaLabel: "GitHub",
        class: "text-slate-700",
      },
    });

    expect(html).toContain("inline-flex");
    expect(html).toContain("items-center");
    expect(html).toContain("text-slate-700");
  });
});

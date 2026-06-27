import { getContainerRenderer } from "@astrojs/react";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { describe, expect, it } from "vitest";

import ListPage from "./ListPage.astro";

const renderers = await loadRenderers([getContainerRenderer()]);
const container = await AstroContainer.create({ renderers });

const BASE_PROPS = {
  pageTitle: "Projects",
  description: "Software projects I have built.",
  wordmark: "プロジェクト",
  heading: "Projects",
  tags: ["React"],
};

function props(overrides: Partial<typeof BASE_PROPS> = {}) {
  return { ...BASE_PROPS, ...overrides };
}

describe("ListPage", () => {
  it("renders the toggle button with label", async () => {
    const html = await container.renderToString(ListPage, { props: props() });

    expect(html).toContain("Filter by tag");
    expect(html).toContain("data-list-page-toggle");
  });

  it("renders the count badge", async () => {
    const html = await container.renderToString(ListPage, { props: props() });

    expect(html).toContain("data-list-page-count");
  });

  it("renders the chevron icon", async () => {
    const html = await container.renderToString(ListPage, { props: props() });

    expect(html).toContain("data-list-page-chevron");
  });

  it("sets aria-expanded to false by default", async () => {
    const html = await container.renderToString(ListPage, { props: props() });

    expect(html).toContain('aria-expanded="false"');
  });

  it("renders the page heading", async () => {
    const html = await container.renderToString(ListPage, {
      props: props({ heading: "Journal" }),
    });

    expect(html).toContain("Journal");
  });

  it("renders the filter panel", async () => {
    const html = await container.renderToString(ListPage, {
      props: props({ tags: ["React", "TypeScript"] }),
    });

    expect(html).toContain("data-list-page-panel");
  });

  it("renders All and one button per tag", async () => {
    const html = await container.renderToString(ListPage, {
      props: props({ tags: ["React", "TypeScript", "Node"] }),
    });

    expect(html).toContain("All");
    expect(html).toContain("React");
    expect(html).toContain("TypeScript");
    expect(html).toContain("Node");
  });

  it("sets data-list-page-tag attributes on each button", async () => {
    const html = await container.renderToString(ListPage, {
      props: props({ tags: ["Astro", "Tailwind"] }),
    });

    expect(html).toContain('data-list-page-tag="all"');
    expect(html).toContain('data-list-page-tag="Astro"');
    expect(html).toContain('data-list-page-tag="Tailwind"');
  });

  it("renders slotted content", async () => {
    const html = await container.renderToString(ListPage, {
      props: props(),
      slots: { default: "<p>slotted content</p>" },
    });

    expect(html).toContain("slotted content");
  });
});

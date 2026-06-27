import { describe, expect, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";

import Group from "./Group.astro";

describe("Group", () => {
  it("renders slot content", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Group, {
      slots: {
        default: "<p>One</p><p>Two</p>",
      },
    });

    expect(html).toContain("<p>One</p>");
    expect(html).toContain("<p>Two</p>");
  });

  it("renders a vertical layout with medium spacing by default", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Group, {
      slots: {
        default: "<p>One</p><p>Two</p>",
      },
    });

    expect(html).toContain("flex-col");
    expect(html).not.toContain("items-center");
    expect(html).toContain("gap-6");
    expect(html).not.toContain("flex-row");
    expect(html).not.toContain("divide-y");
    expect(html).not.toContain("divide-x");
  });

  it("renders a horizontal layout when requested", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Group, {
      props: { direction: "horizontal" },
      slots: {
        default: "<p>One</p><p>Two</p>",
      },
    });

    expect(html).toContain("flex-row");
    expect(html).toContain("items-center");
    expect(html).not.toContain("flex-col");
  });

  it("applies extra small spacing", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Group, {
      props: { spacing: "xs" },
      slots: {
        default: "<p>One</p><p>Two</p>",
      },
    });

    expect(html).toContain("gap-2");
  });

  it("applies small spacing", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Group, {
      props: { spacing: "sm" },
      slots: {
        default: "<p>One</p><p>Two</p>",
      },
    });

    expect(html).toContain("gap-4");
  });

  it("applies large spacing", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Group, {
      props: { spacing: "lg" },
      slots: {
        default: "<p>One</p><p>Two</p>",
      },
    });

    expect(html).toContain("gap-8");
  });

  it("applies extra large spacing", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Group, {
      props: { spacing: "xl" },
      slots: {
        default: "<p>One</p><p>Two</p>",
      },
    });

    expect(html).toContain("gap-12");
  });

  it("applies vertical divider classes when vertical and divided", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Group, {
      props: { variant: "divided" },
      slots: {
        default: "<p>One</p><p>Two</p>",
      },
    });

    expect(html).toContain("divide-y");
    expect(html).toContain("divide-slate-200");
    expect(html).toContain("[&amp;>*]:py-8");
    expect(html).toContain("[&amp;>*:first-child]:pt-0");
    expect(html).toContain("[&amp;>*:last-child]:pb-0");
  });

  it("applies horizontal divider classes when horizontal and divided", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Group, {
      props: { direction: "horizontal", variant: "divided" },
      slots: {
        default: "<span>One</span><span>Two</span>",
      },
    });

    expect(html).toContain("divide-x");
    expect(html).toContain("divide-slate-200");
    expect(html).toContain("[&amp;>*]:px-8");
    expect(html).toContain("[&amp;>*:first-child]:pl-0");
    expect(html).toContain("[&amp;>*:last-child]:pr-0");
  });

  it("merges custom class names", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Group, {
      props: { class: "items-center" },
      slots: {
        default: "<span>Only</span>",
      },
    });

    expect(html).toContain("items-center");
  });
});

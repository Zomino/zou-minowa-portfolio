import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import SummaryCard from "./SummaryCard.astro";

describe("SummaryCard", () => {
  it("covers the card with a screen-reader labelled link", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SummaryCard, {
      props: { href: "/projects/signal-stack", label: "View Signal Stack" },
      slots: { default: "<p>Content</p>" },
    });

    expect(html).toContain('href="/projects/signal-stack"');
    expect(html).toContain("View Signal Stack");
    expect(html).toContain("sr-only");
  });

  it("renders slotted content inside an article", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SummaryCard, {
      props: { href: "/x", label: "View x" },
      slots: { default: "<p>Content</p>" },
    });

    expect(html).toContain("<article");
    expect(html).toContain("<p>Content</p>");
  });

  it("lifts on hover with the standard transition and a passed class", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SummaryCard, {
      props: {
        href: "/x",
        label: "View x",
        class: "gap-5 hover:-translate-y-1",
      },
      slots: { default: "<p>Content</p>" },
    });

    expect(html).toContain("motion-reduce:transition-none");
    expect(html).toContain("gap-5 hover:-translate-y-1");
  });
});

import { describe, expect, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";

import Badge from "./Badge.astro";

describe("Badge", () => {
  it("renders slot content", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Badge, {
      slots: { default: "slot-content" },
    });

    expect(html).toContain("slot-content");
  });

  it("renders default badge styles", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Badge, {
      slots: { default: "slot-content" },
    });

    expect(html).toContain("rounded-full");
    expect(html).toContain("border-slate-200");
    expect(html).toContain("bg-white/90");
  });

  it("applies default styles when variant is default", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Badge, {
      props: { variant: "default" },
      slots: { default: "slot-content" },
    });

    expect(html).toContain("bg-white/90");
    expect(html).not.toContain("bg-slate-100/80");
  });

  it("supports the muted variant", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Badge, {
      props: { variant: "muted" },
      slots: { default: "slot-content" },
    });

    expect(html).toContain("bg-slate-100/80");
    expect(html).not.toContain("bg-white/90");
  });

  it("merges custom classes", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Badge, {
      props: { class: "ring-2 ring-slate-300" },
      slots: { default: "slot-content" },
    });

    expect(html).toContain("ring-2");
    expect(html).toContain("ring-slate-300");
  });
});

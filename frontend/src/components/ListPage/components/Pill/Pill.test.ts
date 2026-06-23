import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import Pill from "./Pill.astro";

describe("Pill", () => {
  it("renders a button with slotted content", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Pill, {
      slots: { default: "React" },
    });

    expect(html).toContain("<button");
    expect(html).toContain("React");
  });

  it("merges a passed class with the base styles", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Pill, {
      props: { class: "bg-slate-900" },
    });

    expect(html).toContain("rounded-full");
    expect(html).toContain("bg-slate-900");
  });

  it("forwards arbitrary attributes onto the button", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Pill, {
      props: { "data-list-page-tag": "React", "aria-expanded": "false" },
    });

    expect(html).toContain('data-list-page-tag="React"');
    expect(html).toContain('aria-expanded="false"');
  });
});

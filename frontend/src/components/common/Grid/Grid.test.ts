import { describe, expect, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";

import Grid from "./Grid.astro";

async function render(
  props: Record<string, unknown> = {},
  slot = "<p>A</p><p>B</p>",
): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Grid, { props, slots: { default: slot } });
}

describe("Grid", () => {
  it("renders slot content", async () => {
    const html = await render({}, "<p>One</p><p>Two</p>");

    expect(html).toContain("<p>One</p>");
    expect(html).toContain("<p>Two</p>");
  });

  it("applies a single column by default", async () => {
    const html = await render();

    expect(html).toContain("grid");
    expect(html).toContain("grid-cols-1");
  });

  it("applies a fixed column count", async () => {
    const html = await render({ columns: 3 });

    expect(html).toContain("grid-cols-3");
    expect(html).not.toContain("lg:grid-cols");
  });

  it("applies responsive columns", async () => {
    const html = await render({ columns: { default: 1, lg: 3 } });

    expect(html).toContain("grid-cols-1");
    expect(html).toContain("lg:grid-cols-3");
  });

  it("applies multiple responsive breakpoints", async () => {
    const html = await render({ columns: { default: 1, sm: 2, lg: 4 } });

    expect(html).toContain("grid-cols-1");
    expect(html).toContain("sm:grid-cols-2");
    expect(html).toContain("lg:grid-cols-4");
  });

  it("wraps the grid in an overflow-hidden container", async () => {
    const html = await render();

    expect(html).toContain("overflow-hidden");
  });

  it("pulls the inner grid out so the outer band is clipped", async () => {
    const html = await render();

    expect(html).toContain("-m-6");
  });

  it("draws inner borders and padding on each cell", async () => {
    const html = await render();

    expect(html).toContain("*:border-b");
    expect(html).toContain("*:border-l");
    expect(html).toContain("*:border-slate-200");
    expect(html).toContain("*:p-6");
  });

  it("does not draw top/right borders (no outer perimeter lines)", async () => {
    const html = await render();

    expect(html).not.toContain("*:border-t");
    expect(html).not.toContain("*:border-r");
  });

  it("keeps the row divider full-width when the last row is partial", async () => {
    // 7 cells in a 3-column grid leave a single cell in the last row. Drawing
    // the divider with border-b (the always-full upper row) rather than
    // border-t (the partial lower row) keeps the line spanning every column.
    const cells = Array.from({ length: 7 }, (_, i) => `<p>${i}</p>`).join("");
    const html = await render({ columns: 3 }, cells);

    expect(html).toContain("*:border-b");
    expect(html).not.toContain("*:border-t");
    expect(html).toContain("<p>6</p>");
  });

  it("does not use gap-based spacing", async () => {
    const html = await render();

    expect(html).not.toContain("gap-");
  });

  it("places custom class names on the outer wrapper", async () => {
    const html = await render({ class: "mt-12" });

    expect(html).toContain("mt-12");
    // the wrapper precedes the inner grid in the markup
    expect(html.indexOf("mt-12")).toBeLessThan(html.indexOf("grid-cols-1"));
  });
});

import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import FontGate from "./FontGate.astro";

describe("FontGate", () => {
  it("renders an inline script", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FontGate);

    expect(html).toContain("<script");
    expect(html).not.toContain('type="module"');
  });

  it("hides the document until fonts load", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FontGate);

    expect(html).toContain(
      'document.documentElement.style.visibility = "hidden"',
    );
  });

  it("reveals once document fonts are ready", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FontGate);

    expect(html).toContain("document.fonts?.ready");
    expect(html).toContain('document.documentElement.style.visibility = ""');
  });

  it("falls back to a timeout so content is never hidden indefinitely", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FontGate);

    expect(html).toContain("Promise.race");
    expect(html).toContain("3000");
  });
});

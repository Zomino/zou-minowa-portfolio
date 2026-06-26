import { getContainerRenderer } from "@astrojs/react";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { describe, expect, it } from "vitest";

import ChatWidget from "./ChatWidget.astro";

const renderers = await loadRenderers([getContainerRenderer()]);
const container = await AstroContainer.create({ renderers });

describe("ChatWidget", () => {
  it("renders the launcher and the chat panel island", async () => {
    const html = await container.renderToString(ChatWidget, {
      request: new Request("https://example.com/projects"),
    });

    expect(html).toContain('aria-label="Open chat"');
    expect(html).toContain('aria-label="Chat assistant"');
  });
});

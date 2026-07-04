import { getContainerRenderer } from "@astrojs/react";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { afterEach, describe, expect, it, vi } from "vitest";

const renderers = await loadRenderers([getContainerRenderer()]);
const container = await AstroContainer.create({ renderers });

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

async function renderChatWidget(enabled?: boolean) {
  vi.doMock("astro:env/client", () => ({ PUBLIC_CHAT_ENABLED: enabled }));
  const { default: ChatWidget } = await import("./ChatWidget.astro");
  return container.renderToString(ChatWidget, {
    request: new Request("https://example.com/projects"),
  });
}

describe("ChatWidget", () => {
  it("renders the launcher and the chat panel island when enabled", async () => {
    const html = await renderChatWidget(true);

    expect(html).toContain('aria-label="Open chat"');
    expect(html).toContain("<astro-island");
  });

  it("omits the launcher and the chat panel island when disabled", async () => {
    const html = await renderChatWidget(false);

    expect(html).not.toContain('aria-label="Open chat"');
    expect(html).not.toContain("<astro-island");
  });
});

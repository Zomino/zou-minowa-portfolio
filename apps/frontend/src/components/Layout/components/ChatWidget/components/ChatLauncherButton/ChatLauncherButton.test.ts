import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import ChatLauncherButton from "./ChatLauncherButton.astro";

describe("ChatLauncherButton", () => {
  it("renders an accessible launcher button", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ChatLauncherButton);

    expect(html).toContain("data-chat-launcher");
    expect(html).toContain('aria-label="Open chat"');
    expect(html).toContain('aria-haspopup="dialog"');
  });
});

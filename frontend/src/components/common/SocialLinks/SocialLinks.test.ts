import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it, vi } from "vitest";

vi.mock("virtual:astro-icon", () => ({
  default: {
    local: {
      prefix: "local",
      icons: {
        github: { body: '<rect width="16" height="16"/>' },
        linkedin: { body: '<rect width="16" height="16"/>' },
        mail: { body: '<rect width="16" height="16"/>' },
      },
    },
  },
  config: { include: {} },
}));

import SocialLinks from "./SocialLinks.astro";

describe("SocialLinks", () => {
  it("renders the email, LinkedIn, and GitHub links", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SocialLinks);

    expect(html).toContain('href="mailto:hello@example.com"');
    expect(html).toContain('aria-label="Email"');
    expect(html).toContain('href="https://www.linkedin.com/in/example"');
    expect(html).toContain('aria-label="LinkedIn"');
    expect(html).toContain('href="https://github.com/example"');
    expect(html).toContain('aria-label="GitHub"');
  });

  it("keeps the expected tab behavior for each link", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SocialLinks);

    expect(html).not.toContain(
      'href="mailto:hello@example.com" target="_blank"',
    );
    expect(html).toContain(
      'href="https://www.linkedin.com/in/example" target="_blank"',
    );
    expect(html).toContain('href="https://github.com/example" target="_blank"');
    expect(html).toContain('rel="noreferrer noopener"');
  });
});

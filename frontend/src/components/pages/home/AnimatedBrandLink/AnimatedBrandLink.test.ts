import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import AnimatedBrandLink from "./AnimatedBrandLink.astro";

describe("AnimatedBrandLink", () => {
  it("renders a link with the provided href", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AnimatedBrandLink, {
      props: { href: "#", animationStartTargetSelector: "[data-target]" },
      slots: { default: "Zou Minowa" },
    });

    expect(html).toContain('href="#"');
    expect(html).toContain("Zou Minowa");
  });

  it("starts hidden with correct ARIA attributes", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AnimatedBrandLink, {
      props: { href: "#", animationStartTargetSelector: "[data-target]" },
      slots: { default: "Zou Minowa" },
    });

    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain("opacity-0");
  });

  it("includes the animated brand link data attribute", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AnimatedBrandLink, {
      props: { href: "#", animationStartTargetSelector: "[data-target]" },
      slots: { default: "Zou Minowa" },
    });

    expect(html).toContain("data-animated-brand-link");
  });
});

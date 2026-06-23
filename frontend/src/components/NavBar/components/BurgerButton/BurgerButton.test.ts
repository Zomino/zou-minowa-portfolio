import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import BurgerButton from "./BurgerButton.astro";

describe("BurgerButton", () => {
  it("renders a button element", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BurgerButton, {
      props: { ariaLabel: "Toggle navigation", ariaControls: "mobile-nav" },
    });

    expect(html).toContain("<button");
    expect(html).toContain('type="button"');
  });

  it("applies the accessibility attributes", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BurgerButton, {
      props: { ariaLabel: "Toggle navigation", ariaControls: "mobile-nav" },
    });

    expect(html).toContain('aria-label="Toggle navigation"');
    expect(html).toContain('aria-controls="mobile-nav"');
    expect(html).toContain('aria-expanded="false"');
  });

  it("includes the data attribute for JS targeting", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BurgerButton, {
      props: { ariaLabel: "Toggle navigation", ariaControls: "mobile-nav" },
    });

    expect(html).toContain("data-navbar-burger");
  });

  it("merges extra classes", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BurgerButton, {
      props: {
        ariaLabel: "Toggle navigation",
        ariaControls: "mobile-nav",
        class: "md:hidden",
      },
    });

    expect(html).toContain("cursor-pointer");
    expect(html).toContain("md:hidden");
  });

  it("renders the burger icon", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BurgerButton, {
      props: { ariaLabel: "Toggle navigation", ariaControls: "mobile-nav" },
    });

    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("h-4 w-5");
  });
});

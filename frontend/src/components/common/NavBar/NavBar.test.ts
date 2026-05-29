import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import NavBar from "./NavBar.astro";

describe("NavBar", () => {
  it("renders the default slot content", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NavBar, {
      props: { navItems: [] },
      slots: { default: '<a href="/">My Site</a>' },
    });

    expect(html).toContain("My Site");
    expect(html).toContain('href="/"');
  });

  it("renders nav items as links", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NavBar, {
      props: {
        navItems: [
          { url: "/about", pageTitle: "About" },
          { url: "/projects", pageTitle: "Projects" },
        ],
      },
      slots: { default: '<a href="/">My Site</a>' },
    });

    expect(html).toContain('href="/about"');
    expect(html).toContain("About");
    expect(html).toContain('href="/projects"');
    expect(html).toContain("Projects");
  });

  it("merges extra classes onto the navigation bar", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NavBar, {
      props: { navItems: [], class: "md:hidden" },
      slots: { default: '<a href="/">My Site</a>' },
    });

    expect(html).toContain("bg-theme");
    expect(html).toContain("shadow-lg");
    expect(html).toContain("md:hidden");
  });

  it("renders the burger button for mobile with correct ARIA attributes", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NavBar, {
      props: { navItems: [] },
      slots: { default: '<a href="/">My Site</a>' },
    });

    expect(html).toContain('aria-label="Toggle navigation"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-controls="navbar-mobile-panel"');
  });

  it("starts with the slide-down menu closed", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NavBar, {
      props: { navItems: [] },
      slots: { default: '<a href="/">My Site</a>' },
    });

    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("max-h-0");
    expect(html).toContain("pointer-events-none");
  });
});

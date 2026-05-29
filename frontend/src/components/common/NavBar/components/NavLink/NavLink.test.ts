import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import NavLink from "./NavLink.astro";

describe("NavLink", () => {
  it("applies the nav link classes", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NavLink, {
      props: { href: "/about" },
      slots: { default: "About" },
    });

    expect(html).toContain("link");
    expect(html).toContain("text-sm");
    expect(html).toContain("text-slate-700");
  });

  it("renders the link with correct href", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NavLink, {
      props: { href: "/about" },
      slots: { default: "About" },
    });

    expect(html).toContain('href="/about"');
    expect(html).toContain("About");
  });

  it("merges extra className", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NavLink, {
      props: { href: "/about", class: "extra-class" },
      slots: { default: "About" },
    });

    expect(html).toContain("text-sm");
    expect(html).toContain("text-slate-700");
    expect(html).toContain("extra-class");
  });
});

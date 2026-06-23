import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import Copyright from "./Copyright.astro";

describe("Copyright", () => {
  it("shows the copyright line with the current year and site name", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Copyright, {
      props: { siteTitle: "Zou Minowa" },
    });

    expect(html).toContain(`© ${new Date().getFullYear()} Zou Minowa`);
  });

  it("uses the small text variant", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Copyright, {
      props: { siteTitle: "Zou Minowa" },
    });

    expect(html).toContain("<span");
    expect(html).toContain("text-small");
  });

  it("applies the muted text color", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Copyright, {
      props: { siteTitle: "Zou Minowa" },
    });

    expect(html).toContain("text-slate-600");
  });
});

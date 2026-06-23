import { describe, expect, it } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";

import ProjectLinks from "./ProjectLinks.astro";

describe("ProjectLinks", () => {
  it("renders github and globe icon links", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectLinks, {
      props: {
        github: "https://github.com/test/repo",
        link: "https://example.com",
      },
    });

    expect(html).toContain("https://github.com/test/repo");
    expect(html).toContain("https://example.com");
  });

  it("merges custom class names", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectLinks, {
      props: {
        github: "https://github.com/test/repo",
        link: "https://example.com",
        class: "relative z-20",
      },
    });

    expect(html).toContain("relative");
    expect(html).toContain("z-20");
  });
});

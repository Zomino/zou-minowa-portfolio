import { getContainerRenderer } from "@astrojs/react";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { describe, expect, it, vi } from "vitest";

import projectImage from "../../../assets/test-fixtures/placeholder.svg";

vi.mock("virtual:astro-icon", () => ({
  default: {
    local: {
      prefix: "local",
      icons: {
        github: { body: '<rect width="16" height="16"/>' },
        globe: { body: '<rect width="16" height="16"/>' },
        chat: { body: '<rect width="16" height="16"/>' },
      },
    },
  },
  config: { include: {} },
}));

vi.mock("astro:content", async () => {
  const EmptyContent = (await import("./EmptyContent.astro")).default;
  return {
    getCollection: vi.fn().mockResolvedValue([]),
    render: vi.fn().mockResolvedValue({ Content: EmptyContent }),
  };
});

import Slug from "../[slug].astro";

const project = {
  id: "painter-portfolio",
  data: {
    title: "Painter Portfolio",
    description: "A portfolio website for my father, a painter.",
    link: "https://www.daisukeminowa.com/",
    github: "https://github.com/Zomino/daisuke-minowa-website",
    image: projectImage,
    tags: ["Next.js", "TypeScript"],
    type: "personal",
    date: new Date("2025-05-31"),
    featured: true,
  },
};

const renderers = await loadRenderers([getContainerRenderer()]);
const container = await AstroContainer.create({ renderers });

describe("project page [slug]", () => {
  it("renders SoftwareSourceCode JSON-LD built from the project", async () => {
    const html = await container.renderToString(Slug, { props: { project } });

    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain('"@type":"SoftwareSourceCode"');
    expect(html).toContain('"name":"Painter Portfolio"');
    expect(html).toContain(
      '"codeRepository":"https://github.com/Zomino/daisuke-minowa-website"',
    );
    expect(html).toContain('"dateCreated":"2025-05-31"');
  });
});

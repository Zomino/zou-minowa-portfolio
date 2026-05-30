import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it, vi } from "vitest";

import projectImage from "../../../../assets/projects/ledgerlight.svg";

vi.mock("virtual:astro-icon", () => ({
  default: {
    local: {
      prefix: "local",
      icons: {
        github: { body: '<rect width="16" height="16"/>' },
        globe: { body: '<rect width="16" height="16"/>' },
      },
    },
  },
  config: { include: {} },
}));

vi.mock("astro:content", () => ({
  getCollection: vi.fn().mockResolvedValue([
    {
      id: "hidden",
      data: {
        title: "Hidden",
        description: "Not featured.",
        link: "https://example.com/hidden",
        github: "https://github.com/example/hidden",
        image: projectImage,
        tags: ["Go"],
        date: new Date("2024-01-01"),
        featured: false,
      },
    },
    {
      id: "oldest",
      data: {
        title: "Oldest Featured",
        description: "Oldest project.",
        link: "https://example.com/oldest",
        github: "https://github.com/example/oldest",
        image: projectImage,
        tags: ["Python"],
        date: new Date("2021-01-01"),
        featured: true,
      },
    },
    {
      id: "newest",
      data: {
        title: "Newest Featured",
        description: "Newest project.",
        link: "https://example.com/newest",
        github: "https://github.com/example/newest",
        image: projectImage,
        tags: ["TypeScript"],
        date: new Date("2025-01-01"),
        featured: true,
      },
    },
    {
      id: "middle",
      data: {
        title: "Middle Featured",
        description: "Middle project.",
        link: "https://example.com/middle",
        github: "https://github.com/example/middle",
        image: projectImage,
        tags: ["Rust"],
        date: new Date("2023-01-01"),
        featured: true,
      },
    },
    {
      id: "extra",
      data: {
        title: "Extra Featured",
        description: "Extra project.",
        link: "https://example.com/extra",
        github: "https://github.com/example/extra",
        image: projectImage,
        tags: ["Java"],
        date: new Date("2022-01-01"),
        featured: true,
      },
    },
  ]),
}));

import FeaturedProjectsSection from "./FeaturedProjectsSection.astro";

describe("FeaturedProjectsSection", () => {
  it("renders the section heading", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FeaturedProjectsSection);

    expect(html).toContain("Featured projects");
  });

  it("renders only featured projects, sorted newest first, limited to three", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FeaturedProjectsSection);

    expect(html).toContain("Newest Featured");
    expect(html).toContain("Middle Featured");
    expect(html).toContain("Extra Featured");
    expect(html).not.toContain("Hidden");
    expect(html).not.toContain("Oldest Featured");
  });

  it("lays out projects in a divided grid that becomes 3 columns on large screens", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FeaturedProjectsSection);

    expect(html).toContain("grid-cols-1");
    expect(html).toContain("lg:grid-cols-3");
    expect(html).toContain("*:border-b");
  });
});

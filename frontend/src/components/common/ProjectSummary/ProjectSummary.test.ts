import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it, vi } from "vitest";

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

import ProjectSummary from "./ProjectSummary.astro";
import projectImage from "../../../assets/projects/ledgerlight.svg";

describe("ProjectSummary", () => {
  it("renders the project content and links", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectSummary, {
      props: {
        title: "Signal Stack",
        description: "Realtime observability platform.",
        link: "https://example.com/signal",
        github: "https://github.com/example/signal",
        image: projectImage,
        tags: ["TypeScript", "Astro"],
        type: "personal",
        slug: "signal-stack",
      },
    });

    expect(html).toContain("Signal Stack");
    // TODO: Re-enable the work/personal label once we display work projects again.
    // expect(html).toContain("personal");
    expect(html).toContain("Realtime observability platform.");
    expect(html).toContain('href="https://github.com/example/signal"');
    expect(html).toContain('href="https://example.com/signal"');
    expect(html).toContain('href="/projects/signal-stack"');
    expect(html).toContain("TypeScript");
    expect(html).toContain("Astro");
  });
});

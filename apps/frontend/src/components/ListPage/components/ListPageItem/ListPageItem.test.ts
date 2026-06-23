import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";

import ListPageItem from "./ListPageItem.astro";

describe("ListPageItem", () => {
  it("marks itself as a list item", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ListPageItem, {
      props: { tags: ["React"] },
    });

    expect(html).toContain("data-list-item");
  });

  it("serialises its tags as JSON that round-trips to the original array", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ListPageItem, {
      props: { tags: ["React", "Node"] },
    });

    const match = html.match(/data-tags="([^"]*)"/);
    const decoded = (match?.[1] ?? "").replace(/&#34;|&quot;/g, '"');
    expect(JSON.parse(decoded)).toEqual(["React", "Node"]);
  });

  it("applies a passed class", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ListPageItem, {
      props: { tags: ["React"], class: "py-8" },
    });

    expect(html).toContain("py-8");
  });

  it("renders slotted content", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ListPageItem, {
      props: { tags: ["React"] },
      slots: { default: "<p>card</p>" },
    });

    expect(html).toContain("card");
  });
});

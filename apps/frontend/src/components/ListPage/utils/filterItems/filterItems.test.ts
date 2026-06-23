// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTagFilter } from "./filterItems";

function setupItems(tagSets: string[][]) {
  document.body.innerHTML = tagSets
    .map(
      (tags) =>
        `<div data-list-item data-tags='${JSON.stringify(tags)}'></div>`,
    )
    .join("");
}

function items() {
  return [...document.querySelectorAll<HTMLElement>("[data-list-item]")];
}

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches });
}

beforeEach(() => {
  Element.prototype.animate = vi.fn();
  mockMatchMedia(false);
});

describe("createTagFilter", () => {
  it("returns an applyFilter function", () => {
    setupItems([["React"]]);

    expect(typeof createTagFilter(document.body)).toBe("function");
  });

  it("hides only items that do not match the active tags", () => {
    setupItems([["React", "Node"], ["Vue"], ["React"]]);
    const applyFilter = createTagFilter(document.body);

    applyFilter(["React"]);

    const [first, second, third] = items();
    expect(first?.classList.contains("hidden")).toBe(false);
    expect(second?.classList.contains("hidden")).toBe(true);
    expect(third?.classList.contains("hidden")).toBe(false);
  });

  it("clears all hidden state when no tags are active", () => {
    setupItems([["React"], ["Vue"]]);
    const applyFilter = createTagFilter(document.body);

    applyFilter(["React"]);
    applyFilter([]);

    expect(items().every((item) => !item.classList.contains("hidden"))).toBe(
      true,
    );
  });

  it("uses a custom item selector when provided", () => {
    document.body.innerHTML = `<div data-card data-tags='${JSON.stringify(["React"])}'></div><div data-card data-tags='${JSON.stringify(["Vue"])}'></div>`;
    const applyFilter = createTagFilter(document.body, "[data-card]");

    applyFilter(["Vue"]);

    const cards = [...document.querySelectorAll<HTMLElement>("[data-card]")];
    expect(cards[0]?.classList.contains("hidden")).toBe(true);
    expect(cards[1]?.classList.contains("hidden")).toBe(false);
  });

  it("matches tags that contain a comma", () => {
    setupItems([["A, B"], ["C"]]);
    const applyFilter = createTagFilter(document.body);

    applyFilter(["A, B"]);

    const [first, second] = items();
    expect(first?.classList.contains("hidden")).toBe(false);
    expect(second?.classList.contains("hidden")).toBe(true);
  });

  it("treats an item with no data-tags as having no tags", () => {
    document.body.innerHTML = `<div data-list-item></div>`;
    const applyFilter = createTagFilter(document.body);
    const [item] = items();

    applyFilter(["React"]);
    expect(item?.classList.contains("hidden")).toBe(true);

    applyFilter([]);
    expect(item?.classList.contains("hidden")).toBe(false);
  });

  it("treats non-array tag data as having no tags", () => {
    document.body.innerHTML = `<div data-list-item data-tags="5"></div>`;
    const applyFilter = createTagFilter(document.body);
    const [item] = items();

    expect(() => applyFilter(["React"])).not.toThrow();
    expect(item?.classList.contains("hidden")).toBe(true);
  });

  it("does not animate or throw when reduced motion is preferred", () => {
    setupItems([["React"], ["Vue"]]);
    mockMatchMedia(true);
    const applyFilter = createTagFilter(document.body);

    expect(() => applyFilter(["React"])).not.toThrow();
    expect(Element.prototype.animate).not.toHaveBeenCalled();
  });

  it("shows items matching any of several active tags", () => {
    setupItems([["React"], ["Vue"], ["Svelte"]]);
    const applyFilter = createTagFilter(document.body);

    applyFilter(["React", "Svelte"]);

    const [first, second, third] = items();
    expect(first?.classList.contains("hidden")).toBe(false);
    expect(second?.classList.contains("hidden")).toBe(true);
    expect(third?.classList.contains("hidden")).toBe(false);
  });

  it("fades in items that become visible", () => {
    setupItems([["React"], ["Vue"]]);
    const applyFilter = createTagFilter(document.body);

    applyFilter(["React"]);
    vi.mocked(Element.prototype.animate).mockClear();
    applyFilter(["Vue"]);

    expect(Element.prototype.animate).toHaveBeenCalledWith(
      [
        { opacity: 0, transform: "scale(0.96)" },
        { opacity: 1, transform: "none" },
      ],
      expect.objectContaining({ duration: 250 }),
    );
  });

  it("slides items that stay visible but move to a new position", () => {
    setupItems([["Vue"], ["React"]]);
    const mover = items()[1];
    if (!mover) throw new Error("expected a second item");
    mover.getBoundingClientRect = vi
      .fn()
      .mockReturnValueOnce(new DOMRect(0, 100, 0, 0))
      .mockReturnValue(new DOMRect(0, 0, 0, 0));
    const applyFilter = createTagFilter(document.body);

    applyFilter(["React"]);

    expect(mover.animate).toHaveBeenCalledWith(
      [{ transform: "translate(0px, 100px)" }, { transform: "none" }],
      expect.objectContaining({ duration: 300 }),
    );
  });

  it("does not animate items that neither move nor appear", () => {
    setupItems([["React"], ["Vue"]]);
    const applyFilter = createTagFilter(document.body);

    applyFilter([]);

    expect(Element.prototype.animate).not.toHaveBeenCalled();
  });
});

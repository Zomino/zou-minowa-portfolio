const ITEM_SELECTOR = "[data-list-item]";
const SCALE_IN_DURATION = 250;
const MOVE_DURATION = 300;

interface ItemSnapshot {
  firstRects: Map<HTMLElement, DOMRect>;
  wasHidden: Map<HTMLElement, boolean>;
}

const parseItemTags = (raw: string | undefined): string[] => {
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((tag): tag is string => typeof tag === "string");
};

const matchesFilter = (item: HTMLElement, tags: string[]) => {
  const itemTags = parseItemTags(item.dataset["tags"]);
  return tags.length === 0 || itemTags.some((tag) => tags.includes(tag));
};

const snapshotItems = (items: NodeListOf<HTMLElement>): ItemSnapshot => {
  const firstRects = new Map<HTMLElement, DOMRect>();
  const wasHidden = new Map<HTMLElement, boolean>();
  items.forEach((item) => {
    const hidden = item.classList.contains("hidden");
    wasHidden.set(item, hidden);
    if (!hidden) {
      firstRects.set(item, item.getBoundingClientRect());
    }
  });
  return { firstRects, wasHidden };
};

const updateVisibility = (items: NodeListOf<HTMLElement>, tags: string[]) => {
  items.forEach((item) => {
    item.classList.toggle("hidden", !matchesFilter(item, tags));
  });
};

const animateAppearance = (item: HTMLElement) => {
  item.animate(
    [
      { opacity: 0, transform: "scale(0.96)" },
      { opacity: 1, transform: "none" },
    ],
    { duration: SCALE_IN_DURATION, easing: "ease-out" },
  );
};

const animateMove = (item: HTMLElement, before: DOMRect) => {
  const after = item.getBoundingClientRect();
  const dx = before.left - after.left;
  const dy = before.top - after.top;
  if (!dx && !dy) return;
  item.animate(
    [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }],
    { duration: MOVE_DURATION, easing: "ease-out" },
  );
};

const playTransitions = (
  items: NodeListOf<HTMLElement>,
  { firstRects, wasHidden }: ItemSnapshot,
) => {
  items.forEach((item) => {
    if (item.classList.contains("hidden")) return;

    if (wasHidden.get(item)) {
      animateAppearance(item);
      return;
    }

    const before = firstRects.get(item);
    if (before) animateMove(item, before);
  });
};

const applyFilter = (
  items: NodeListOf<HTMLElement>,
  prefersReducedMotion: boolean,
  tags: string[],
) => {
  const snapshot = snapshotItems(items);

  updateVisibility(items, tags);

  if (prefersReducedMotion) return;

  playTransitions(items, snapshot);
};

export const createTagFilter = (
  root: ParentNode,
  itemSelector = ITEM_SELECTOR,
) => {
  const items = root.querySelectorAll<HTMLElement>(itemSelector);
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  return (tags: string[]) => applyFilter(items, prefersReducedMotion, tags);
};

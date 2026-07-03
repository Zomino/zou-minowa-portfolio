const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const REVEAL_ROOT_MARGIN = "0px 0px -10% 0px";
const BATCH_STAGGER_MS = 100;
const RISE_DURATION_MS = 500;

const HIDDEN_FRAME = { opacity: "0", transform: "translateY(1rem)" };
const VISIBLE_FRAME = { opacity: "1", transform: "translateY(0)" };

function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function holdHidden(target: Element) {
  return target.animate([HIDDEN_FRAME], { fill: "forwards" });
}

function rise(target: Element, delay: number) {
  target.animate([HIDDEN_FRAME, VISIBLE_FRAME], {
    duration: RISE_DURATION_MS,
    easing: "ease-out",
    delay,
    fill: "backwards",
  });
}

export async function setupScrollReveal(root: Document) {
  if (!window.IntersectionObserver) return;
  if (typeof Element.prototype.animate !== "function") return;
  if (prefersReducedMotion()) return;

  const pendingReveals = new Map<Element, Animation>();
  root.querySelectorAll("[data-reveal]").forEach((element) => {
    pendingReveals.set(element, holdHidden(element));
  });

  await root.fonts?.ready;

  const observer = new IntersectionObserver(
    (entries, activeObserver) => {
      const intersecting = entries.filter((entry) => entry.isIntersecting);
      intersecting.forEach((entry, index) => {
        pendingReveals.get(entry.target)?.cancel();
        rise(entry.target, index * BATCH_STAGGER_MS);
        activeObserver.unobserve(entry.target);
      });
    },
    { rootMargin: REVEAL_ROOT_MARGIN },
  );

  pendingReveals.forEach((_hold, element) => {
    observer.observe(element);
  });
}

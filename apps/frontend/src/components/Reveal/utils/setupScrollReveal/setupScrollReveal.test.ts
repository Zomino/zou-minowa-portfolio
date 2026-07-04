// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import { setupScrollReveal } from "./setupScrollReveal";

type IntersectionCallback = (
  entries: Array<{ target: Element; isIntersecting: boolean }>,
  observer: { unobserve(target: Element): void },
) => void;

function setupElements(count: number) {
  document.body.innerHTML = Array.from(
    { length: count },
    () => "<div data-reveal></div>",
  ).join("");
}

function elements() {
  return [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
}

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches });
}

const cancel = vi.fn();
const animate = vi.fn().mockReturnValue({ cancel });

function riseCalls() {
  return animate.mock.calls.filter(([, options]) => options?.duration);
}

const observe = vi.fn();
const unobserve = vi.fn();
let intersectionCallback: IntersectionCallback | undefined;

class MockIntersectionObserver {
  observe = observe;
  unobserve = unobserve;

  constructor(callback: IntersectionCallback) {
    intersectionCallback = callback;
  }
}

function mockIntersectionObserver() {
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
}

function intersect(target: Element | undefined, isIntersecting: boolean) {
  if (!target) throw new Error("missing reveal element");
  intersectionCallback?.([{ target, isIntersecting }], { unobserve });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  document.documentElement.className = "";
  intersectionCallback = undefined;
  Reflect.deleteProperty(document, "fonts");
  Element.prototype.animate = animate;
  mockMatchMedia(false);
  mockIntersectionObserver();
});

describe("setupScrollReveal", () => {
  it("holds every reveal element hidden before fonts are ready", async () => {
    setupElements(2);

    await setupScrollReveal(document);

    expect(animate).toHaveBeenCalledTimes(2);
    const [, options] = animate.mock.calls[0] ?? [];
    expect(options).toEqual({ fill: "forwards" });
  });

  it("observes every reveal element", async () => {
    setupElements(3);

    await setupScrollReveal(document);

    const [first, second, third] = elements();
    expect(observe).toHaveBeenCalledWith(first);
    expect(observe).toHaveBeenCalledWith(second);
    expect(observe).toHaveBeenCalledWith(third);
  });

  it("cancels the hold and rises an element once it intersects", async () => {
    setupElements(1);
    await setupScrollReveal(document);
    const [element] = elements();

    intersect(element, true);

    expect(cancel).toHaveBeenCalled();
    expect(riseCalls()).toHaveLength(1);
    expect(unobserve).toHaveBeenCalledWith(element);
  });

  it("does not rise an element that is not intersecting", async () => {
    setupElements(1);
    await setupScrollReveal(document);
    const [element] = elements();

    intersect(element, false);

    expect(riseCalls()).toHaveLength(0);
    expect(unobserve).not.toHaveBeenCalled();
  });

  it("staggers elements that intersect in the same batch", async () => {
    setupElements(3);
    await setupScrollReveal(document);
    const [first, second, third] = elements();
    if (!first || !second || !third) throw new Error("missing reveal element");

    intersectionCallback?.(
      [
        { target: first, isIntersecting: true },
        { target: second, isIntersecting: false },
        { target: third, isIntersecting: true },
      ],
      { unobserve },
    );

    const delays = riseCalls().map(([, options]) => options.delay);
    expect(delays).toEqual([0, 100]);
  });

  it("does not carry stagger delays over to later batches", async () => {
    setupElements(2);
    await setupScrollReveal(document);
    const [first, second] = elements();

    intersect(first, true);
    intersect(second, true);

    const delays = riseCalls().map(([, options]) => options.delay);
    expect(delays).toEqual([0, 0]);
  });

  it("waits for document fonts before observing", async () => {
    setupElements(1);
    let releaseFonts = () => {};
    const ready: Promise<void> = new Promise((resolve) => {
      releaseFonts = resolve;
    });
    Object.defineProperty(document, "fonts", {
      value: { ready },
      configurable: true,
    });

    const pending = setupScrollReveal(document);
    expect(observe).not.toHaveBeenCalled();

    releaseFonts();
    await pending;
    expect(observe).toHaveBeenCalled();
  });

  it("leaves content visible when reduced motion is preferred", async () => {
    setupElements(2);
    mockMatchMedia(true);

    await setupScrollReveal(document);

    expect(animate).not.toHaveBeenCalled();
    expect(observe).not.toHaveBeenCalled();
  });

  it("leaves content visible when IntersectionObserver is unavailable", async () => {
    setupElements(1);
    vi.stubGlobal("IntersectionObserver", undefined);

    await setupScrollReveal(document);

    expect(animate).not.toHaveBeenCalled();
  });
});

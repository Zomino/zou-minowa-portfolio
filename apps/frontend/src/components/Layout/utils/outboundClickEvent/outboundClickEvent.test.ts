import { describe, expect, it } from "vitest";
import { outboundClickEvent } from "./outboundClickEvent";

describe("outboundClickEvent", () => {
  it("ignores same-origin links, which are already counted as page views", () => {
    const result = outboundClickEvent({
      origin: "https://zouminowa.com",
      currentOrigin: "https://zouminowa.com",
      href: "https://zouminowa.com/projects",
      label: "Projects",
    });

    expect(result).toBeNull();
  });

  it("records external links with a trimmed label", () => {
    const result = outboundClickEvent({
      origin: "https://github.com",
      currentOrigin: "https://zouminowa.com",
      href: "https://github.com/Zomino",
      label: "  GitHub  ",
    });

    expect(result).toEqual({
      href: "https://github.com/Zomino",
      label: "GitHub",
    });
  });

  it("records mailto links, which report an empty origin", () => {
    const result = outboundClickEvent({
      origin: "",
      currentOrigin: "https://zouminowa.com",
      href: "mailto:zouminowa@gmail.com",
      label: "Email",
    });

    expect(result).toEqual({
      href: "mailto:zouminowa@gmail.com",
      label: "Email",
    });
  });

  it("truncates very long labels to 100 characters", () => {
    const result = outboundClickEvent({
      origin: "https://example.com",
      currentOrigin: "https://zouminowa.com",
      href: "https://example.com",
      label: "a".repeat(150),
    });

    expect(result?.label).toHaveLength(100);
  });
});

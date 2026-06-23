import { describe, expect, it } from "vitest";
import { formatDate } from "./formatDate";

describe("formatDate", () => {
  it("formats as short month and year in en-US by default", () => {
    const date = new Date(2020, 0, 15);
    expect(formatDate(date)).toBe("Jan 2020");
  });

  it("accepts a custom format", () => {
    const date = new Date(2020, 5, 1);
    expect(formatDate(date, { format: { year: "numeric" } })).toBe("2020");
  });

  it("accepts a custom locale", () => {
    const date = new Date(2020, 0, 15);
    const formatted = formatDate(date, {
      locale: "fr-FR",
      format: { month: "long", year: "numeric" },
    });
    expect(formatted).toMatch(/2020/);
    expect(formatted.toLowerCase()).toContain("janvier");
  });

  it("uses the default month+year format when only locale is overridden", () => {
    const date = new Date(2020, 0, 15);
    expect(formatDate(date, { locale: "en-GB" })).toBe("Jan 2020");
  });
});

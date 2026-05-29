import { describe, expect, expectTypeOf, it } from "vitest";
import { require } from "./require";

describe("require", () => {
  it("strips nullish values from the type union", () => {
    const value: string | undefined = "home";

    expectTypeOf(require(value)).toEqualTypeOf<string>();
  });

  it("returns a defined string unchanged", () => {
    expect(require("hello")).toBe("hello");
  });

  it("returns a defined object unchanged", () => {
    const value = { heading: "Core skills" };

    expect(require(value)).toBe(value);
  });

  it("throws on undefined", () => {
    expect(() => require(undefined)).toThrowError("Value is required.");
  });

  it("throws on null", () => {
    expect(() => require(null)).toThrowError("Value is required.");
  });
});

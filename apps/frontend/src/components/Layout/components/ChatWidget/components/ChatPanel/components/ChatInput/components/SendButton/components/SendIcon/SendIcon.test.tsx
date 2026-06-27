// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SendIcon } from "./SendIcon";

afterEach(cleanup);

describe("SendIcon", () => {
  it("renders a decorative send glyph with the passed class", () => {
    const { container } = render(<SendIcon className="h-5 w-5" />);
    const svg = container.querySelector("svg");

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("h-5", "w-5");
    expect(container.querySelector("polygon")).toBeInTheDocument();
  });
});

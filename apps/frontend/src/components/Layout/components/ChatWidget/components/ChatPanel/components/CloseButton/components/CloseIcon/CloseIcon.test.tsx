// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CloseIcon } from "./CloseIcon";

afterEach(cleanup);

describe("CloseIcon", () => {
  it("renders a decorative cross with the passed class", () => {
    const { container } = render(<CloseIcon className="h-5 w-5" />);
    const svg = container.querySelector("svg");

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("h-5", "w-5");
    expect(container.querySelectorAll("line")).toHaveLength(2);
  });
});

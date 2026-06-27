// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TypingIndicator } from "./TypingIndicator";

afterEach(cleanup);

describe("TypingIndicator", () => {
  it("renders three animated dots", () => {
    const { container } = render(<TypingIndicator />);

    expect(container.querySelectorAll(".animate-bounce")).toHaveLength(3);
  });
});

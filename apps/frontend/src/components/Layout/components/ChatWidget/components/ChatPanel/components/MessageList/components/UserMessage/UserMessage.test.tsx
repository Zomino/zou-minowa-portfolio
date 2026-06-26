// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { UserMessage } from "./UserMessage";

afterEach(cleanup);

describe("UserMessage", () => {
  it("renders the content as plain text aligned right", () => {
    const { container } = render(<UserMessage content="Hello" />);

    expect(container.querySelector("li")).toHaveClass("justify-end");
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});

// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SendButton } from "./SendButton";

afterEach(cleanup);

describe("SendButton", () => {
  it("renders an enabled submit button", () => {
    render(<SendButton disabled={false} />);
    const button = screen.getByRole("button", { name: "Send message" });

    expect(button).toHaveAttribute("type", "submit");
    expect(button).toBeEnabled();
  });

  it("disables the button when disabled is true", () => {
    render(<SendButton disabled />);

    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });
});

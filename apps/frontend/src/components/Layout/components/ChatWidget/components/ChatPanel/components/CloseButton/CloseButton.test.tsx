// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CloseButton } from "./CloseButton";

afterEach(cleanup);

describe("CloseButton", () => {
  it("calls onClick when the button is pressed", () => {
    const onClick = vi.fn();
    render(<CloseButton onClick={onClick} />);

    fireEvent.click(screen.getByLabelText("Close chat"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

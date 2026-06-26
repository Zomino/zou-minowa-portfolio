// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ChatPanel from "./ChatPanel";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

const openPanel = () => {
  act(() => {
    window.dispatchEvent(new Event("chat:open"));
  });
};

describe("ChatPanel", () => {
  it("renders the greeting", () => {
    render(<ChatPanel />);
    expect(screen.getByText(/Ask me anything about Zou/i)).toBeInTheDocument();
  });

  it("dispatches chat:closed when the close button is clicked", () => {
    const closed = vi.fn();
    window.addEventListener("chat:closed", closed);
    render(<ChatPanel />);
    openPanel();
    fireEvent.click(screen.getByLabelText("Close chat"));
    expect(closed).toHaveBeenCalled();
    window.removeEventListener("chat:closed", closed);
  });
});

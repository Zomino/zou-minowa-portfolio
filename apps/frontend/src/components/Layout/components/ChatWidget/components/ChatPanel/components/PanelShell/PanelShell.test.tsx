// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PanelShell } from "./PanelShell";

afterEach(cleanup);

describe("PanelShell", () => {
  it("renders a dialog with the passed placement class and children when open", () => {
    render(
      <PanelShell isOpen className="fixed bottom-0">
        <p>panel body</p>
      </PanelShell>,
    );
    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveClass("fixed", "bottom-0");
    expect(dialog).toHaveAttribute("aria-hidden", "false");
    expect(screen.getByText("panel body")).toBeInTheDocument();
  });

  it("hides and inerts the dialog when closed", () => {
    const { container } = render(
      <PanelShell isOpen={false}>
        <p>panel body</p>
      </PanelShell>,
    );
    const dialog = container.querySelector('[role="dialog"]');

    expect(dialog).toHaveAttribute("aria-hidden", "true");
    expect(dialog).toHaveAttribute("inert");
  });
});

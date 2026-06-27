// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChatInput } from "./ChatInput";

afterEach(cleanup);

describe("ChatInput", () => {
  it("sends the trimmed value and clears the field", () => {
    const onSend = vi.fn();
    render(<ChatInput active={true} disabled={false} onSend={onSend} />);

    const input = screen.getByLabelText("Your message");
    fireEvent.change(input, { target: { value: "  hello  " } });
    fireEvent.click(screen.getByLabelText("Send message"));

    expect(onSend).toHaveBeenCalledWith("hello");
    expect(input).toHaveValue("");
  });

  it("does not send when disabled", () => {
    const onSend = vi.fn();
    render(<ChatInput active={true} disabled={true} onSend={onSend} />);

    const input = screen.getByLabelText("Your message");
    fireEvent.change(input, { target: { value: "hi" } });

    const form = input.closest("form");
    expect(form).not.toBeNull();
    if (form) fireEvent.submit(form);

    expect(onSend).not.toHaveBeenCalled();
  });

  it("does not send empty input", () => {
    const onSend = vi.fn();
    render(<ChatInput active={true} disabled={false} onSend={onSend} />);

    fireEvent.click(screen.getByLabelText("Send message"));

    expect(onSend).not.toHaveBeenCalled();
  });

  it("focuses the input once it is active and enabled after streaming", () => {
    const { rerender } = render(
      <ChatInput active={true} disabled={true} onSend={() => {}} />,
    );
    expect(screen.getByLabelText("Your message")).not.toHaveFocus();

    rerender(<ChatInput active={true} disabled={false} onSend={() => {}} />);
    expect(screen.getByLabelText("Your message")).toHaveFocus();
  });

  it("does not focus the input while the panel is closed", () => {
    render(<ChatInput active={false} disabled={false} onSend={() => {}} />);

    expect(screen.getByLabelText("Your message")).not.toHaveFocus();
  });

  it("caps input at MAX_INPUT_CHARS", () => {
    render(<ChatInput active disabled={false} onSend={() => {}} />);
    expect(screen.getByLabelText("Your message")).toHaveAttribute(
      "maxLength",
      "1000",
    );
  });

  it("disables send for an over-length value", () => {
    const onSend = vi.fn();
    render(<ChatInput active disabled={false} onSend={onSend} />);
    const input = screen.getByLabelText("Your message");
    fireEvent.change(input, { target: { value: "x".repeat(1001) } });
    fireEvent.click(screen.getByLabelText("Send message"));
    expect(onSend).not.toHaveBeenCalled();
  });

  it("debounces rapid double submits", () => {
    const onSend = vi.fn();
    render(<ChatInput active disabled={false} onSend={onSend} />);
    const input = screen.getByLabelText("Your message");
    fireEvent.change(input, { target: { value: "hi" } });
    fireEvent.click(screen.getByLabelText("Send message"));
    fireEvent.change(input, { target: { value: "hi" } });
    fireEvent.click(screen.getByLabelText("Send message"));
    expect(onSend).toHaveBeenCalledTimes(1);
  });
});

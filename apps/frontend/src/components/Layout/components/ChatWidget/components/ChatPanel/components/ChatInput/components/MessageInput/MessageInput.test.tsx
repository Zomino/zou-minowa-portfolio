// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MessageInput } from "./MessageInput";

afterEach(cleanup);

describe("MessageInput", () => {
  it("renders the labelled field with its value", () => {
    render(<MessageInput value="hi" onChange={() => {}} disabled={false} />);

    expect(screen.getByLabelText("Your message")).toHaveValue("hi");
  });

  it("calls onChange with the new value", () => {
    const onChange = vi.fn();
    render(<MessageInput value="" onChange={onChange} disabled={false} />);

    fireEvent.change(screen.getByLabelText("Your message"), {
      target: { value: "hello" },
    });

    expect(onChange).toHaveBeenCalledWith("hello");
  });

  it("disables the field when disabled is true", () => {
    render(<MessageInput value="" onChange={() => {}} disabled />);

    expect(screen.getByLabelText("Your message")).toBeDisabled();
  });
});

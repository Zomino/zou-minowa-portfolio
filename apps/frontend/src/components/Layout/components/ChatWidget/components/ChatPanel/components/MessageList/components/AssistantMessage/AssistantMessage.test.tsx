// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AssistantMessage } from "./AssistantMessage";

afterEach(cleanup);

describe("AssistantMessage", () => {
  it("renders the content as markdown aligned left", () => {
    const { container } = render(<AssistantMessage content="**bold** text" />);

    expect(container.querySelector("li")).toHaveClass("justify-start");
    expect(container.querySelector("strong")).toHaveTextContent("bold");
  });

  it("escapes dangerous markup in the content", () => {
    const { container } = render(
      <AssistantMessage content="<img src=x onerror=alert(1)>" />,
    );

    expect(container.querySelector("img")).toBeNull();
  });

  it("shows typing dots inside the bubble while pending", () => {
    const { container } = render(<AssistantMessage content="" pending />);

    expect(
      container.querySelectorAll('[class*="animate-bounce"]'),
    ).toHaveLength(3);
  });

  it("shows no typing dots once resolved", () => {
    const { container } = render(<AssistantMessage content="done" />);

    expect(
      container.querySelectorAll('[class*="animate-bounce"]'),
    ).toHaveLength(0);
  });
});

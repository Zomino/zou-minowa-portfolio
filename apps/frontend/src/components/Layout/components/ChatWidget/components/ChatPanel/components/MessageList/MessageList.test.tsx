// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MessageList } from "./MessageList";

afterEach(cleanup);

describe("MessageList", () => {
  it("renders the greeting followed by each message", () => {
    render(
      <MessageList
        greeting="Welcome aboard"
        messages={[
          { role: "user", content: "question one" },
          { role: "assistant", content: "answer two" },
        ]}
      />,
    );

    expect(screen.getByText(/Welcome aboard/)).toBeInTheDocument();
    expect(screen.getByText(/question one/)).toBeInTheDocument();
    expect(screen.getByText(/answer two/)).toBeInTheDocument();
  });
});

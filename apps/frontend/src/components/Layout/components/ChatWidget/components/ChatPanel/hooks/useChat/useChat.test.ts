// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useChat } from "./useChat";
import { sendChatRequest } from "./utils/sendChatRequest/sendChatRequest";

vi.mock("./utils/sendChatRequest/sendChatRequest");
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("useChat", () => {
  it("appends the user message and the assistant reply, sending pageSlug", async () => {
    vi.mocked(sendChatRequest).mockResolvedValue({ ok: true, reply: "Hello" });
    const { result } = renderHook(() => useChat({ pageSlug: "/projects" }));
    await act(async () => {
      await result.current.send("Tell me about your work");
    });
    await waitFor(() =>
      expect(result.current.messages).toEqual([
        { role: "user", content: "Tell me about your work" },
        { role: "assistant", content: "Hello" },
      ]),
    );
    expect(sendChatRequest).toHaveBeenCalledWith({
      messages: [{ role: "user", content: "Tell me about your work" }],
      pageSlug: "/projects",
    });
    expect(result.current.isSending).toBe(false);
  });

  it("shows the error message and sets a cooldown on a retry delay", async () => {
    const before = Date.now();
    vi.mocked(sendChatRequest).mockResolvedValue({
      ok: false,
      message: "Slow down",
      retryAfterMs: 5000,
    });
    const { result } = renderHook(() => useChat());
    await act(async () => {
      await result.current.send("hi");
    });
    expect(result.current.messages.at(-1)).toEqual({
      role: "assistant",
      content: "Slow down",
    });
    expect(result.current.cooldownUntil).toBeGreaterThanOrEqual(before + 5000);
  });

  it("ignores empty input", async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => {
      await result.current.send("   ");
    });
    expect(sendChatRequest).not.toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
  });
});

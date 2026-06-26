// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { MAX_INPUT_CHARS } from "@zou/chat-contract";

import { useChat } from "./useChat";

vi.mock("axios");
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("useChat", () => {
  it("appends the user message and the assistant reply, sending pageSlug", async () => {
    const post = vi
      .mocked(axios.post)
      .mockResolvedValue({ data: { reply: "Hello" } });
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
    expect(post).toHaveBeenCalledWith("/api/chat", {
      messages: [{ role: "user", content: "Tell me about your work" }],
      pageSlug: "/projects",
    });
    expect(result.current.isSending).toBe(false);
  });

  it("shows the error message and sets a cooldown on rate_limited", async () => {
    const before = Date.now();
    vi.mocked(axios.isAxiosError).mockReturnValue(true);
    vi.mocked(axios.post).mockRejectedValue({
      response: {
        data: {
          reason: "rate_limited",
          message: "Slow down",
          retryAfterMs: 5000,
        },
      },
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
    const post = vi.mocked(axios.post);
    const { result } = renderHook(() => useChat());
    await act(async () => {
      await result.current.send("   ");
    });
    expect(post).not.toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
  });

  it("rejects an over-long message via the schema without sending", async () => {
    const post = vi.mocked(axios.post);
    const { result } = renderHook(() => useChat());
    await act(async () => {
      await result.current.send("a".repeat(MAX_INPUT_CHARS + 1));
    });
    expect(post).not.toHaveBeenCalled();
    expect(result.current.messages.at(-1)?.role).toBe("assistant");
  });
});

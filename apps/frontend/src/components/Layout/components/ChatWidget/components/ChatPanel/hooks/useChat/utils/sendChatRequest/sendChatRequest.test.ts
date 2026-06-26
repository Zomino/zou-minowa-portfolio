import { afterEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { MAX_INPUT_CHARS } from "@zou/chat-contract";

import { sendChatRequest } from "./sendChatRequest";

vi.mock("axios");
afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

const body = (content: string) => ({
  messages: [{ role: "user" as const, content }],
  pageSlug: "/projects",
});

describe("sendChatRequest", () => {
  it("returns the reply on success", async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { reply: "Hello" } });

    expect(await sendChatRequest(body("hi"))).toEqual({
      ok: true,
      reply: "Hello",
    });
  });

  it("returns the message and retry delay on rate_limited", async () => {
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

    expect(await sendChatRequest(body("hi"))).toEqual({
      ok: false,
      message: "Slow down",
      retryAfterMs: 5000,
    });
  });

  it("falls back when the error has no response body", async () => {
    vi.mocked(axios.isAxiosError).mockReturnValue(false);
    vi.mocked(axios.post).mockRejectedValue(new Error("network"));

    const result = await sendChatRequest(body("hi"));
    expect(result.ok).toBe(false);
    expect(result).not.toHaveProperty("retryAfterMs");
  });

  it("rejects an over-long message without posting", async () => {
    const post = vi.mocked(axios.post);
    const result = await sendChatRequest(body("a".repeat(MAX_INPUT_CHARS + 1)));

    expect(result.ok).toBe(false);
    expect(post).not.toHaveBeenCalled();
  });
});

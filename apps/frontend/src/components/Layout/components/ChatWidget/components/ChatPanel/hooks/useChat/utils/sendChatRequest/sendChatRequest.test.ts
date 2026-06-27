import { afterEach, describe, expect, it, vi } from "vitest";

import { sendChatRequest } from "./sendChatRequest";
import { apiPost } from "@/utils/apiPost/apiPost";

vi.mock("astro:env/client", () => ({ PUBLIC_CHAT_API_URL: undefined }));
vi.mock("@/utils/apiPost/apiPost");
afterEach(() => {
  vi.clearAllMocks();
});

const body = {
  messages: [{ role: "user" as const, content: "hi" }],
  pageSlug: "/projects",
};

describe("sendChatRequest", () => {
  it("maps a 200 response to an ok result", async () => {
    vi.mocked(apiPost).mockResolvedValue({
      status: 200,
      body: { reply: "Hello" },
    });

    expect(await sendChatRequest(body)).toEqual({ ok: true, reply: "Hello" });
  });

  it("posts to the fallback path when no API URL is configured", async () => {
    vi.mocked(apiPost).mockResolvedValue({
      status: 200,
      body: { reply: "Hello" },
    });

    await sendChatRequest(body);

    expect(apiPost).toHaveBeenCalledWith("/api/chat", expect.anything());
  });

  it("maps a 429 response to a result with a retry delay", async () => {
    vi.mocked(apiPost).mockResolvedValue({
      status: 429,
      body: {
        reason: "rate_limited",
        message: "Slow down",
        retryAfterMs: 5000,
      },
    });

    expect(await sendChatRequest(body)).toEqual({
      ok: false,
      message: "Slow down",
      retryAfterMs: 5000,
    });
  });

  it("maps another error response to a result without a retry delay", async () => {
    vi.mocked(apiPost).mockResolvedValue({
      status: 503,
      body: { reason: "unavailable", message: "Down" },
    });

    const result = await sendChatRequest(body);
    expect(result).toEqual({ ok: false, message: "Down" });
    expect(result).not.toHaveProperty("retryAfterMs");
  });

  it("falls back when there is no response", async () => {
    vi.mocked(apiPost).mockResolvedValue(null);

    expect(await sendChatRequest(body)).toEqual({
      ok: false,
      message: "Something went wrong. Please try again.",
    });
  });

  it("rejects an unsafe body without calling apiPost", async () => {
    const result = await sendChatRequest({
      messages: [{ role: "user" as const, content: "" }],
      pageSlug: "/projects",
    });

    expect(result.ok).toBe(false);
    expect(apiPost).not.toHaveBeenCalled();
  });
});

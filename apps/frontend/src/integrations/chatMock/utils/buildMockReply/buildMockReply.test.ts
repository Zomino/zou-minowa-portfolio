import { describe, expect, it } from "vitest";
import type { ChatContract } from "@zou/chat-contract";

import { buildMockReply } from "./buildMockReply";

const makeRequestBody = (
  content: string,
  pageSlug?: string,
): ChatContract["request"]["body"] => ({
  messages: [{ role: "user", content }],
  pageSlug,
});

describe("buildMockReply", () => {
  it("returns a 200 reply echoing the message and page slug", () => {
    const result = buildMockReply(makeRequestBody("Hello there", "/projects"));
    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      reply: expect.stringContaining("Hello there"),
    });
  });

  it("returns rate_limited with a retry delay when the message contains ratelimit", () => {
    const result = buildMockReply(makeRequestBody("please ratelimit me"));
    expect(result.status).toBe(429);
    expect(result.body).toEqual({
      reason: "rate_limited",
      message: expect.any(String),
      retryAfterMs: expect.any(Number),
    });
  });

  it("returns unavailable when the message contains unavailable", () => {
    const result = buildMockReply(makeRequestBody("are you unavailable"));
    expect(result.status).toBe(503);
    expect(result.body).toEqual({
      reason: "unavailable",
      message: expect.any(String),
    });
  });
});

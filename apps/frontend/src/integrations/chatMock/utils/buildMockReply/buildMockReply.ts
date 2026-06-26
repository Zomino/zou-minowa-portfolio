import type { ChatContract } from "@zou/chat-contract";

export const buildMockReply = (
  body: ChatContract["request"]["body"],
): ChatContract["response"] => {
  const lastMessage = body.messages.at(-1)?.content ?? "";
  const text = lastMessage.toLowerCase();

  if (text.includes("ratelimit")) {
    return {
      status: 429,
      body: {
        reason: "rate_limited",
        message: "Too many messages. Please wait a moment.",
        retryAfterMs: 15000,
      },
    };
  }

  if (text.includes("unavailable")) {
    return {
      status: 503,
      body: {
        reason: "unavailable",
        message: "The assistant is unavailable right now.",
      },
    };
  }

  return {
    status: 200,
    body: {
      reply: `Mock reply${body.pageSlug ? ` (page ${body.pageSlug})` : ""}: you said "${lastMessage}".`,
    },
  };
};

import { chatRequestSchema, type ChatContract } from "@zou/chat-contract";

import { buildSystemPrompt } from "./buildSystemPrompt";
import { PORTFOLIO } from "./portfolio";

export type ChatMessage = ChatContract["request"]["body"]["messages"][number];

export interface ChatReply {
  reply: string;
  tokens: number;
}

export interface ChatModel {
  generate(args: {
    systemPrompt: string;
    messages: ChatMessage[];
  }): Promise<ChatReply>;
}

export type ProtectionVerdict =
  | { allowed: true }
  | { allowed: false; reason: "rate_limited"; retryAfterMs: number }
  | { allowed: false; reason: "budget_exhausted" };

export interface ChatProtection {
  check(clientId: string): Promise<ProtectionVerdict>;
  record(args: { tokens: number }): Promise<void>;
}

export interface ChatDeps {
  model: ChatModel;
  protection: ChatProtection;
}

const systemPrompt = buildSystemPrompt(PORTFOLIO);

export const handleChatRequest = async (
  payload: unknown,
  clientId: string,
  deps: ChatDeps,
): Promise<ChatContract["response"]> => {
  const parsed = chatRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      status: 400,
      body: {
        reason: "invalid_request",
        message: "Sorry, that request was not valid.",
      },
    };
  }

  try {
    const verdict = await deps.protection.check(clientId);

    if (verdict.allowed) {
      const { reply, tokens } = await deps.model.generate({
        systemPrompt,
        messages: parsed.data.body.messages,
      });
      await deps.protection.record({ tokens });

      return { status: 200, body: { reply } };
    }

    if (verdict.reason === "rate_limited") {
      return {
        status: 429,
        body: {
          reason: "rate_limited",
          message: "Too many requests. Please slow down and try again shortly.",
          retryAfterMs: verdict.retryAfterMs,
        },
      };
    }

    return {
      status: 503,
      body: {
        reason: "budget_exhausted",
        message:
          "The chat has reached its usage limit for today. Please try again tomorrow.",
      },
    };
  } catch {
    return {
      status: 503,
      body: {
        reason: "unavailable",
        message: "The chat is unavailable right now. Please try again later.",
      },
    };
  }
};

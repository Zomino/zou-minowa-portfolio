import { chatRequestSchema, type ChatContract } from "@zou/chat-contract";

import { buildPageContext } from "../buildPageContext/buildPageContext";
import {
  buildSystemPrompt,
  type Portfolio,
} from "../buildSystemPrompt/buildSystemPrompt";
import portfolio from "../portfolio.generated.json";

const PORTFOLIO: Portfolio = portfolio;

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

export interface ChatGuardrail {
  inspect(args: {
    text: string;
    source: "input" | "output";
  }): Promise<{ blocked: boolean }>;
}

export interface ChatDeps {
  model: ChatModel;
  protection: ChatProtection;
  guardrail: ChatGuardrail;
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

    if (!verdict.allowed && verdict.reason === "rate_limited") {
      return {
        status: 429,
        body: {
          reason: "rate_limited",
          message: "Too many requests. Please slow down and try again shortly.",
          retryAfterMs: verdict.retryAfterMs,
        },
      };
    }

    if (!verdict.allowed) {
      return {
        status: 503,
        body: {
          reason: "budget_exhausted",
          message:
            "The chat has reached its usage limit for today. Please try again tomorrow.",
        },
      };
    }

    const { messages, pageSlug } = parsed.data.body;
    const userText = messages.at(-1)?.content ?? "";

    const inputCheck = await deps.guardrail.inspect({
      text: userText,
      source: "input",
    });
    if (inputCheck.blocked) {
      return {
        status: 400,
        body: {
          reason: "blocked",
          message: "Sorry, that request is not something I can help with.",
        },
      };
    }

    const pageContext = buildPageContext(PORTFOLIO, pageSlug);
    const { reply, tokens } = await deps.model.generate({
      systemPrompt: pageContext
        ? `${systemPrompt}\n\n${pageContext}`
        : systemPrompt,
      messages,
    });
    await deps.protection.record({ tokens });

    const outputCheck = await deps.guardrail.inspect({
      text: reply,
      source: "output",
    });
    if (outputCheck.blocked) {
      return {
        status: 200,
        body: { reply: "Sorry, I cannot help with that." },
      };
    }

    return { status: 200, body: { reply } };
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

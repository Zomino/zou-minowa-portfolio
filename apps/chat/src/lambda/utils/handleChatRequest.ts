import { chatRequestSchema, type ChatContract } from "@zou/chat-contract";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatReply {
  reply: string;
}

export interface ChatModel {
  generate(args: { messages: ChatMessage[] }): Promise<ChatReply>;
}

export interface ChatDeps {
  model: ChatModel;
}

const parseJson = (rawBody: string | null) => {
  try {
    return JSON.parse(rawBody ?? "");
  } catch {
    return null;
  }
};

export const handleChatRequest = async (
  rawBody: string | null,
  deps: ChatDeps,
): Promise<ChatContract["response"]> => {
  const parsed = chatRequestSchema.safeParse(parseJson(rawBody));

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
    const { reply } = await deps.model.generate({
      messages: parsed.data.body.messages,
    });

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

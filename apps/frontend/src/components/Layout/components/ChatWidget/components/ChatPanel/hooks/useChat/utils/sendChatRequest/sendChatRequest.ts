import {
  chatRequestSchema,
  chatResponseSchema,
  type ChatContract,
} from "@zou/chat-contract";
import { PUBLIC_CHAT_API_URL } from "astro:env/client";

import { apiPost } from "@/utils/apiPost/apiPost";

type ChatResult =
  | { ok: true; reply: string }
  | { ok: false; message: string; retryAfterMs?: number };

export const sendChatRequest = async (
  body: ChatContract["request"]["body"],
): Promise<ChatResult> => {
  const request = chatRequestSchema.safeParse({ body });
  if (!request.success) {
    return {
      ok: false,
      message:
        request.error.issues[0]?.message ??
        "Something went wrong. Please try again.",
    };
  }

  const response = await apiPost(
    PUBLIC_CHAT_API_URL ?? "/api/chat",
    request.data.body,
  );
  const parsed = response && chatResponseSchema.safeParse(response);
  if (!parsed || !parsed.success) {
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  const { data } = parsed;
  if (data.status === 200) {
    return { ok: true, reply: data.body.reply };
  }
  if (data.body.reason === "rate_limited") {
    return {
      ok: false,
      message: data.body.message,
      retryAfterMs: data.body.retryAfterMs,
    };
  }
  return { ok: false, message: data.body.message };
};

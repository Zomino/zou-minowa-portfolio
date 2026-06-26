import axios, { isAxiosError } from "axios";
import { chatRequestSchema, type ChatContract } from "@zou/chat-contract";

type ChatResponse = ChatContract["response"];
type SuccessBody = Extract<ChatResponse, { status: 200 }>["body"];
type ErrorBody = Exclude<ChatResponse, { status: 200 }>["body"];

type ChatResult =
  | { ok: true; reply: string }
  | { ok: false; message: string; retryAfterMs?: number };

const FALLBACK_ERROR = "Something went wrong. Please try again.";

export const sendChatRequest = async (
  body: ChatContract["request"]["body"],
): Promise<ChatResult> => {
  const parsed = chatRequestSchema.safeParse({ body });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? FALLBACK_ERROR,
    };
  }

  try {
    const { data } = await axios.post<SuccessBody>(
      "/api/chat",
      parsed.data.body,
    );
    return { ok: true, reply: data.reply };
  } catch (error) {
    const err = isAxiosError<ErrorBody>(error) && error.response?.data;
    if (err && err.reason === "rate_limited") {
      return {
        ok: false,
        message: err.message,
        retryAfterMs: err.retryAfterMs,
      };
    }
    return { ok: false, message: err ? err.message : FALLBACK_ERROR };
  }
};

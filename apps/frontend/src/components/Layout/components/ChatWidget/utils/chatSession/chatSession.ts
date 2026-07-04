import { chatMessageSchema } from "@zou/chat-contract";
import { z } from "zod";

const chatSessionSchema = z.object({
  messages: z.array(chatMessageSchema),
  cooldownUntil: z.number().nullable(),
  open: z.boolean(),
});

export type ChatSession = z.infer<typeof chatSessionSchema>;

const SESSION_KEY = "chat-session";

const emptyChatSession = () => {
  const session: ChatSession = {
    messages: [],
    cooldownUntil: null,
    open: false,
  };

  return session;
};

export const loadChatSession = () => {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY) ?? "";
    const parsed = chatSessionSchema.safeParse(JSON.parse(raw));

    return parsed.success ? parsed.data : emptyChatSession();
  } catch {
    return emptyChatSession();
  }
};

export const updateChatSession = (patch: Partial<ChatSession>) => {
  try {
    const session = { ...loadChatSession(), ...patch };
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    return;
  }
};

import { useCallback, useState } from "react";

import { sendChatRequest } from "./utils/sendChatRequest/sendChatRequest";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const userMessage = (content: string): ChatMessage => ({
  role: "user",
  content,
});
const assistantMessage = (content: string): ChatMessage => ({
  role: "assistant",
  content,
});

export const useChat = ({
  pageSlug,
}: { pageSlug?: string | undefined } = {}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed === "" || isSending) return;

      const conversation = [...messages, userMessage(trimmed)];
      setMessages(conversation);
      setIsSending(true);

      const result = await sendChatRequest({
        messages: conversation,
        pageSlug,
      });
      if (!result.ok && result.retryAfterMs) {
        setCooldownUntil(Date.now() + result.retryAfterMs);
      }
      setMessages((prev) => [
        ...prev,
        assistantMessage(result.ok ? result.reply : result.message),
      ]);
      setIsSending(false);
    },
    [messages, isSending, pageSlug],
  );

  return { messages, isSending, cooldownUntil, send };
};

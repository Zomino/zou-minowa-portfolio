import { useCallback, useEffect, useRef, useState } from "react";

import { useChat } from "./hooks/useChat/useChat";
import {
  loadChatSession,
  updateChatSession,
} from "./utils/chatSession/chatSession";
import { ChatInput } from "./components/ChatInput/ChatInput";
import { CloseButton } from "./components/CloseButton/CloseButton";
import { MessageList } from "./components/MessageList/MessageList";
import { PanelShell } from "./components/PanelShell/PanelShell";

interface Props {
  pageSlug?: string;
  className?: string;
}

const GREETING =
  "Hello. Ask me anything about Zou's projects, skills, or experience.";

const useChatVisibility = () => {
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => {
    setIsOpen(false);
    updateChatSession({ open: false });
    window.dispatchEvent(new Event("chat:closed"));
  }, []);

  useEffect(() => {
    const open = () => {
      setIsOpen(true);
      updateChatSession({ open: true });
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("chat:open", open);
    window.addEventListener("keydown", onKeyDown);
    if (loadChatSession().open) window.dispatchEvent(new Event("chat:open"));

    return () => {
      window.removeEventListener("chat:open", open);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [close]);

  return { isOpen, close };
};

const useCooldown = (until: number | null) => {
  const [coolingDown, setCoolingDown] = useState(false);

  useEffect(() => {
    if (until === null) return;
    const remaining = until - Date.now();
    if (remaining <= 0) {
      setCoolingDown(false);
      return;
    }
    setCoolingDown(true);
    const timer = setTimeout(() => setCoolingDown(false), remaining);
    return () => clearTimeout(timer);
  }, [until]);

  return coolingDown;
};

const useAutoScroll = (
  messageCount: number,
  isOpen: boolean,
  isPending: boolean,
) => {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messageCount, isOpen, isPending]);

  return ref;
};

const ChatPanel = ({ pageSlug, className }: Props) => {
  const { messages, isSending, cooldownUntil, send } = useChat({
    pageSlug,
  });
  const { isOpen, close } = useChatVisibility();
  const coolingDown = useCooldown(cooldownUntil);
  const logRef = useAutoScroll(messages.length, isOpen, isSending);

  return (
    <PanelShell isOpen={isOpen} className={className}>
      <header className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3">
        <p className="heading-5">Ask about my work</p>
        <CloseButton onClick={close} />
      </header>
      <MessageList
        ref={logRef}
        className="flex-1"
        greeting={GREETING}
        messages={messages}
        isPending={isSending}
      />
      <ChatInput
        active={isOpen}
        disabled={isSending || coolingDown}
        onSend={send}
      />
    </PanelShell>
  );
};

export default ChatPanel;

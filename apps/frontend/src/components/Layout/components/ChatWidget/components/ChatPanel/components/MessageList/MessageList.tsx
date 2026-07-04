import { Fragment, type Ref } from "react";

import type { ChatMessage as Message } from "../../hooks/useChat/useChat";
import { AssistantMessage } from "./components/AssistantMessage/AssistantMessage";
import { UserMessage } from "./components/UserMessage/UserMessage";

interface Props {
  messages: Message[];
  greeting: string;
  isPending?: boolean;
  className?: string;
  ref?: Ref<HTMLOListElement>;
}

interface MessageEntry extends Message {
  pending: boolean;
}

const buildMessageEntries = (messages: Message[], isPending: boolean) => {
  const entries: MessageEntry[] = messages.map((message) => ({
    ...message,
    pending: false,
  }));
  return isPending
    ? [...entries, { role: "assistant", content: "", pending: true }]
    : entries;
};

export const MessageList = ({
  messages,
  greeting,
  isPending = false,
  className = "",
  ref,
}: Props) => {
  const entries = buildMessageEntries(messages, isPending);

  return (
    <ol
      ref={ref}
      className={`${className} flex flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4`}
      aria-live="polite"
      aria-atomic="false"
    >
      <AssistantMessage content={greeting} />
      {entries.map((message, index) => (
        <Fragment key={index}>
          {message.role === "user" && <UserMessage content={message.content} />}
          {message.role === "assistant" && (
            <AssistantMessage
              content={message.content}
              pending={message.pending}
            />
          )}
        </Fragment>
      ))}
    </ol>
  );
};

import { Fragment, type Ref } from "react";

import type { ChatMessage as Message } from "../../hooks/useChat/useChat";
import { AssistantMessage } from "./components/AssistantMessage/AssistantMessage";
import { UserMessage } from "./components/UserMessage/UserMessage";

interface Props {
  messages: Message[];
  greeting: string;
  className?: string;
  ref?: Ref<HTMLOListElement>;
}

export const MessageList = ({
  messages,
  greeting,
  className = "",
  ref,
}: Props) => (
  <ol
    ref={ref}
    className={`${className} flex flex-col gap-3 overflow-y-auto px-4 py-4`}
    aria-live="polite"
    aria-atomic="false"
  >
    <AssistantMessage content={greeting} />
    {messages.map((message, index) => (
      <Fragment key={index}>
        {message.role === "user" && <UserMessage content={message.content} />}
        {message.role === "assistant" && (
          <AssistantMessage content={message.content} />
        )}
      </Fragment>
    ))}
  </ol>
);

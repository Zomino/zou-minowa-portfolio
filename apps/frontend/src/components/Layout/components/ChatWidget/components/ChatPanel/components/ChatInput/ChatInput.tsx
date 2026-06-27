import { MAX_INPUT_CHARS } from "@zou/chat-contract";
import type { SyntheticEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { MessageInput } from "./components/MessageInput/MessageInput";
import { SendButton } from "./components/SendButton/SendButton";

interface Props {
  active: boolean;
  disabled: boolean;
  onSend: (text: string) => void;
}

const SEND_DEBOUNCE_MS = 400;

export const ChatInput = ({ active, disabled, onSend }: Props) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSentRef = useRef(0);

  const tooLong = value.length > MAX_INPUT_CHARS;
  const isEmpty = value.trim() === "";

  useEffect(() => {
    if (active && !disabled) inputRef.current?.focus();
  }, [active, disabled]);

  const submit = (event: SyntheticEvent) => {
    event.preventDefault();
    const text = value.trim();
    if (isEmpty || disabled || tooLong) return;
    if (Date.now() - lastSentRef.current < SEND_DEBOUNCE_MS) return;
    lastSentRef.current = Date.now();

    onSend(text);
    setValue("");
  };

  return (
    <form
      className="flex items-center gap-2 border-t border-slate-200/80 p-3"
      onSubmit={submit}
    >
      <MessageInput
        ref={inputRef}
        className="min-w-0 flex-1"
        value={value}
        onChange={setValue}
        disabled={disabled}
      />
      <SendButton disabled={disabled || tooLong || isEmpty} />
    </form>
  );
};

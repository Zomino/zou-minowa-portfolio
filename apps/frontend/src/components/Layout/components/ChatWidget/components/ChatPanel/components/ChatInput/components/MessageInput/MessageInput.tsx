import { MAX_INPUT_CHARS } from "@zou/chat-contract";
import type { ChangeEvent, Ref } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

const INPUT_ID = "chat-message-input";

export const MessageInput = ({
  value,
  onChange,
  disabled,
  className = "",
  ref,
}: Props) => (
  <>
    <label className="sr-only" htmlFor={INPUT_ID}>
      Your message
    </label>
    <input
      ref={ref}
      id={INPUT_ID}
      name="message"
      type="text"
      autoComplete="off"
      placeholder="Ask about Zou's work"
      className={`${className} rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 transition outline-none focus:border-slate-400 disabled:opacity-50`}
      value={value}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        onChange(event.target.value)
      }
      disabled={disabled}
      maxLength={MAX_INPUT_CHARS}
    />
  </>
);

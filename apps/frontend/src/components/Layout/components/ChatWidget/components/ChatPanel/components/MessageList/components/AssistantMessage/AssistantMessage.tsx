import clsx from "clsx";
import Markdown from "react-markdown";

import { TypingIndicator } from "./components/TypingIndicator/TypingIndicator";

interface Props {
  content: string;
  pending?: boolean;
}

const ALLOWED_ELEMENTS = [
  "p",
  "strong",
  "em",
  "code",
  "a",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
];

export const AssistantMessage = ({ content, pending = false }: Props) => {
  const rowClassName = clsx(
    "grid motion-safe:transition-[grid-template-rows] motion-safe:duration-250 motion-safe:ease-out",
    pending ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
  );
  const contentClassName = clsx(
    "rich-text text-sm motion-safe:transition-opacity motion-safe:delay-100 motion-safe:duration-300",
    pending ? "opacity-0" : "opacity-100",
  );

  return (
    <li className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3">
        {pending && <TypingIndicator />}
        <div className={rowClassName}>
          <div className="overflow-hidden">
            <div className={contentClassName}>
              <Markdown
                allowedElements={ALLOWED_ELEMENTS}
                unwrapDisallowed
                components={{
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </Markdown>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

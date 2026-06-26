import Markdown from "react-markdown";

interface Props {
  content: string;
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

export const AssistantMessage = ({ content }: Props) => (
  <li className="flex justify-start">
    <div className="max-w-[85%] rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3">
      <div className="rich-text text-sm">
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
  </li>
);

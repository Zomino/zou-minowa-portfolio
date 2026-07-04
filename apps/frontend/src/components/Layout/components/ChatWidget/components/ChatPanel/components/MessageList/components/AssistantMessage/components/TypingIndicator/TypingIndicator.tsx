const DOT_CLASS =
  "h-2 w-2 motion-safe:animate-bounce rounded-full bg-slate-400";

export const TypingIndicator = () => (
  <span className="flex h-5 items-center gap-1" aria-hidden="true">
    <span className={`${DOT_CLASS} [animation-delay:-0.3s]`} />
    <span className={`${DOT_CLASS} [animation-delay:-0.15s]`} />
    <span className={DOT_CLASS} />
  </span>
);

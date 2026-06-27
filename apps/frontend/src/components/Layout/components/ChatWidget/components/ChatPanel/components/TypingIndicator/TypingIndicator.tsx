const DOT_CLASS = "h-2 w-2 animate-bounce rounded-full bg-slate-400";

export const TypingIndicator = () => (
  <div className="px-4 py-2" aria-hidden="true">
    <span className="flex gap-1">
      <span className={`${DOT_CLASS} [animation-delay:-0.3s]`} />
      <span className={`${DOT_CLASS} [animation-delay:-0.15s]`} />
      <span className={DOT_CLASS} />
    </span>
  </div>
);

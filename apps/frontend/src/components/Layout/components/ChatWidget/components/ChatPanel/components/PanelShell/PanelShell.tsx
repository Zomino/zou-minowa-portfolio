import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
  isOpen: boolean;
  className?: string | undefined;
  children: ReactNode;
}

const BASE_CLASS =
  "bg-theme transition duration-200 ease-out motion-reduce:transition-none flex h-[90dvh] flex-col overflow-hidden rounded-t-2xl border-t border-slate-200 pb-[env(safe-area-inset-bottom)] shadow-xl sm:h-[70vh] sm:max-h-[32rem] sm:w-96 sm:rounded-2xl sm:border sm:pb-0";
const OPEN_CLASS = "translate-y-0 opacity-100";
const CLOSED_CLASS =
  "pointer-events-none translate-y-full sm:translate-y-2 sm:opacity-0";

export const PanelShell = ({ isOpen, className = "", children }: Props) => {
  const shellClassName = clsx(
    className,
    BASE_CLASS,
    isOpen ? OPEN_CLASS : CLOSED_CLASS,
  );

  return (
    <div
      className={shellClassName}
      role="dialog"
      aria-label="Chat assistant"
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      {children}
    </div>
  );
};

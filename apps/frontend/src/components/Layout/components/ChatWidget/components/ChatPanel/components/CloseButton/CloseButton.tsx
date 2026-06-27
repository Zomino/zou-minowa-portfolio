import { CloseIcon } from "./components/CloseIcon/CloseIcon";

interface Props {
  onClick: () => void;
}

export const CloseButton = ({ onClick }: Props) => (
  <button
    type="button"
    aria-label="Close chat"
    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
    onClick={onClick}
  >
    <CloseIcon className="h-5 w-5" />
  </button>
);

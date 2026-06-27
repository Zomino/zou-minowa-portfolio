import { SendIcon } from "./components/SendIcon/SendIcon";

interface Props {
  disabled: boolean;
}

export const SendButton = ({ disabled }: Props) => (
  <button
    type="submit"
    aria-label="Send message"
    className="text-theme flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-900 transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-default disabled:opacity-50"
    disabled={disabled}
  >
    <SendIcon className="h-5 w-5" />
  </button>
);

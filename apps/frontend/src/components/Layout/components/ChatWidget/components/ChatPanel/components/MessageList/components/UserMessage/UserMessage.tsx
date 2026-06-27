interface Props {
  content: string;
}

export const UserMessage = ({ content }: Props) => (
  <li className="flex justify-end">
    <div className="text-theme max-w-[85%] rounded-2xl bg-slate-900 px-4 py-2 text-sm">
      {content}
    </div>
  </li>
);

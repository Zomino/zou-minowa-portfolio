const MAX_LABEL_LENGTH = 100;

export interface OutboundClick {
  href: string;
  label: string;
}

export function outboundClickEvent(args: {
  origin: string;
  currentOrigin: string;
  href: string;
  label: string;
}): OutboundClick | null {
  if (args.origin === args.currentOrigin) {
    return null;
  }

  return {
    href: args.href,
    label: args.label.trim().slice(0, MAX_LABEL_LENGTH),
  };
}

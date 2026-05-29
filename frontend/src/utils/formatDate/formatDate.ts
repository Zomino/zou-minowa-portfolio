const DEFAULT_LOCALE = "en-US";

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
};

export interface FormatDateOptions {
  locale?: string | string[];
  format?: Intl.DateTimeFormatOptions;
}

export const formatDate = (
  value: Date,
  options?: FormatDateOptions,
): string => {
  const locale = options?.locale ?? DEFAULT_LOCALE;
  const format = options?.format ?? DEFAULT_FORMAT;
  return value.toLocaleDateString(locale, format);
};

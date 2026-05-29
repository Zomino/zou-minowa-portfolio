export const require = <T>(value: T): NonNullable<T> => {
  if (value == null) {
    throw new Error("Value is required.");
  }

  return value;
};

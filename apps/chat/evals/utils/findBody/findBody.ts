export const findBody = (
  entries: { slug: string; body: string }[],
  slug: string,
) => {
  const entry = entries.find((candidate) => candidate.slug === slug);

  if (!entry) {
    throw new Error(`Unknown slug ${slug}.`);
  }

  return entry.body;
};

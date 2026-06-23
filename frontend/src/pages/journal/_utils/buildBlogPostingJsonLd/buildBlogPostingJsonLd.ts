interface JournalEntry {
  id: string;
  data: {
    title: string;
    description: string;
    tags: string[];
    date: Date;
  };
}

export const buildBlogPostingJsonLd = (
  siteUrl: string,
  entry: JournalEntry,
  authorName: string,
): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: entry.data.title,
  description: entry.data.description,
  url: new URL(`journal/${entry.id}`, siteUrl).href,
  datePublished: entry.data.date.toISOString().split("T")[0],
  keywords: entry.data.tags,
  inLanguage: "en",
  author: {
    "@type": "Person",
    name: authorName,
    url: siteUrl,
  },
});

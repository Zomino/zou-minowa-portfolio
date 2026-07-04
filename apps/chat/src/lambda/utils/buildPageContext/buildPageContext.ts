import type { Portfolio } from "../buildSystemPrompt/buildSystemPrompt";

const MAX_PAGE_SLUG_CHARS = 200;

export const buildPageContext = (portfolio: Portfolio, pageSlug?: string) => {
  if (!pageSlug || pageSlug.length > MAX_PAGE_SLUG_CHARS) return "";

  const path = pageSlug.replace(/\/+$/, "") || "/";

  const project = portfolio.projects.find(
    (entry) => `/projects/${entry.slug}` === path,
  );
  if (project) {
    return `The visitor is currently on the page ${path}, which is the project "${project.title}".`;
  }

  const journalEntry = portfolio.journal.find(
    (entry) => `/journal/${entry.slug}` === path,
  );
  if (journalEntry) {
    return `The visitor is currently on the page ${path}, which is the journal entry "${journalEntry.title}".`;
  }

  return `The visitor is currently on the page ${path}.`;
};

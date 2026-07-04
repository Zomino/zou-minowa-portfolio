interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  github?: string;
  body: string;
}

interface JournalEntry {
  title: string;
  description: string;
  tags: string[];
  date: string;
  body: string;
}

export interface Portfolio {
  name: string;
  headline: string;
  projects: Project[];
  journal: JournalEntry[];
}

const renderProject = (project: Project) => {
  const lines = [
    `### ${project.title}`,
    project.description,
    `Tags: ${project.tags.join(", ")}`,
  ];

  project.link && lines.push(`Link: ${project.link}`);
  project.github && lines.push(`Repository: ${project.github}`);

  lines.push("", project.body);

  return lines.join("\n");
};

const renderJournalEntry = (entry: JournalEntry) => {
  const lines = [
    `### ${entry.title}`,
    entry.description,
    `Date: ${entry.date}`,
    `Tags: ${entry.tags.join(", ")}`,
    "",
    entry.body,
  ];

  return lines.join("\n");
};

export const buildSystemPrompt = (portfolio: Portfolio) => {
  const projects = portfolio.projects.map(renderProject).join("\n\n");
  const journal = portfolio.journal.map(renderJournalEntry).join("\n\n");

  return `You are the assistant for ${portfolio.name}'s portfolio. ${portfolio.headline}

## Projects

${projects}

## Journal

${journal}

Answer questions about ${portfolio.name} using only the information above. If a question is not covered, say that you do not know.`;
};

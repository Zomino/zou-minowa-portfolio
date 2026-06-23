interface FullProject {
  data: {
    title: string;
    description: string;
    tags: string[];
    link: string;
    github: string;
    date: Date;
  };
  body?: string | undefined;
}

interface FullJournalEntry {
  data: {
    title: string;
    description: string;
    date: Date;
  };
  body?: string | undefined;
}

interface FullMetadata {
  siteTitle: string;
  siteDescription: string;
}

export const buildLlmsFullTxt = (
  projects: FullProject[],
  journal: FullJournalEntry[],
  metadata: FullMetadata,
): string => {
  const sortedProjects = [...projects].sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  const projectSections = sortedProjects.map(
    (project) => `## ${project.data.title}

${project.data.description}

Tech: ${project.data.tags.join(", ")}
Live: ${project.data.link}
Code: ${project.data.github}

${project.body ?? ""}`,
  );

  const sortedJournal = [...journal].sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  const journalSections = sortedJournal.map(
    (entry) => `## ${entry.data.title}

${entry.data.description}

${entry.body ?? ""}`,
  );

  return `# ${metadata.siteTitle}

> ${metadata.siteDescription}

# Projects

${projectSections.join("\n\n---\n\n")}

# Journal

${journalSections.join("\n\n---\n\n")}
`;
};

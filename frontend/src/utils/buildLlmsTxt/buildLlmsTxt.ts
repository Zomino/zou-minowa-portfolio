interface IndexProject {
  id: string;
  data: {
    title: string;
    description: string;
    date: Date;
  };
}

interface IndexMetadata {
  siteTitle: string;
  siteDescription: string;
  skills: string[];
}

export const buildLlmsTxt = (
  site: URL,
  projects: IndexProject[],
  journal: IndexProject[],
  metadata: IndexMetadata,
): string => {
  const byDateDescending = (a: IndexProject, b: IndexProject) =>
    b.data.date.getTime() - a.data.date.getTime();

  const projectLines = [...projects].sort(byDateDescending).map((project) => {
    const url = new URL(`projects/${project.id}`, site).href;
    return `- [${project.data.title}](${url}): ${project.data.description}`;
  });

  const journalLines = [...journal].sort(byDateDescending).map((entry) => {
    const url = new URL(`journal/${entry.id}`, site).href;
    return `- [${entry.data.title}](${url}): ${entry.data.description}`;
  });

  return `# ${metadata.siteTitle}

> ${metadata.siteDescription} Core skills: ${metadata.skills.join(", ")}.

## About

- [Homepage](${new URL("", site).href}): Bio, skills overview, and featured projects.

## Projects

- [All projects](${new URL("projects", site).href}): Full project listing.
${projectLines.join("\n")}

## Journal

- [All entries](${new URL("journal", site).href}): Full journal listing.
${journalLines.join("\n")}

## Optional

- [Full profile](${new URL("llms-full.txt", site).href}): Complete inline content including full project write-ups.
`;
};

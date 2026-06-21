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

interface FullMetadata {
  siteTitle: string;
  siteDescription: string;
}

export const buildLlmsFullTxt = (
  projects: FullProject[],
  metadata: FullMetadata,
): string => {
  const sorted = [...projects].sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  const projectSections = sorted.map(
    (project) => `## ${project.data.title}

${project.data.description}

Tech: ${project.data.tags.join(", ")}
Live: ${project.data.link}
Code: ${project.data.github}

${project.body ?? ""}`,
  );

  return `# ${metadata.siteTitle}

> ${metadata.siteDescription}

# Projects

${projectSections.join("\n\n---\n\n")}
`;
};

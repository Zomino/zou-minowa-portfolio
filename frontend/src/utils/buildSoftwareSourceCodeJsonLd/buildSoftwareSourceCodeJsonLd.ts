interface CodeProject {
  data: {
    title: string;
    description: string;
    link: string;
    github: string;
    tags: string[];
    date: Date;
  };
}

export const buildSoftwareSourceCodeJsonLd = (
  siteUrl: string,
  project: CodeProject,
  authorName: string,
): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: project.data.title,
  description: project.data.description,
  url: project.data.link,
  codeRepository: project.data.github,
  programmingLanguage: project.data.tags,
  dateCreated: project.data.date.toISOString().split("T")[0],
  author: {
    "@type": "Person",
    name: authorName,
    url: siteUrl,
  },
});

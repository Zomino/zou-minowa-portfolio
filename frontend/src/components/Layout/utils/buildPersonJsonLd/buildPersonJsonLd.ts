interface PersonMetadata {
  siteTitle: string;
  siteDescription: string;
  jobTitle: string;
  email: string;
  github: string;
  linkedin: string;
  skills: string[];
}

export const buildPersonJsonLd = (
  siteUrl: string,
  metadata: PersonMetadata,
): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: metadata.siteTitle,
  jobTitle: metadata.jobTitle,
  description: metadata.siteDescription,
  url: siteUrl,
  email: metadata.email,
  sameAs: [metadata.github, metadata.linkedin],
  knowsAbout: metadata.skills,
});

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import matter from "gray-matter";

type Entry = Pick<ReturnType<typeof matter>, "data" | "content"> & {
  slug: string;
};

interface Metadata {
  siteTitle: string;
  siteDescription: string;
}

const here = dirname(fileURLToPath(import.meta.url));
const frontendDir = join(here, "..", "..", "..", "..", "frontend", "src");
const contentDir = join(frontendDir, "content");
const metadataFile = join(frontendDir, "metadata.json");
const outFile = join(
  here,
  "..",
  "..",
  "..",
  "src",
  "lambda",
  "utils",
  "portfolio.generated.json",
);

const formatDate = (date: string | Date) =>
  date instanceof Date ? date.toISOString().slice(0, 10) : String(date);

export const buildPortfolio = ({
  metadata,
  projects,
  journal,
}: {
  metadata: Metadata;
  projects: Entry[];
  journal: Entry[];
}) => ({
  name: metadata.siteTitle,
  headline: metadata.siteDescription,
  projects: projects.map(({ slug, data, content }) => ({
    slug,
    title: data.title,
    description: data.description,
    tags: data.tags ?? [],
    body: content.trim(),
    ...(data.link ? { link: data.link } : {}),
    ...(data.github ? { github: data.github } : {}),
  })),
  journal: journal.map(({ slug, data, content }) => ({
    slug,
    title: data.title,
    description: data.description,
    tags: data.tags ?? [],
    date: formatDate(data.date ?? ""),
    body: content.trim(),
  })),
});

const readCollection = (name: string) => {
  const dir = join(contentDir, name);

  return readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(readFileSync(join(dir, file), "utf8"));

      return { slug: file.replace(/\.md$/, ""), data, content };
    });
};

export const generate = () => {
  const metadata: Metadata = JSON.parse(readFileSync(metadataFile, "utf8"));
  const projects = readCollection("projects");
  const journal = readCollection("journal");
  const portfolio = buildPortfolio({ metadata, projects, journal });

  writeFileSync(outFile, `${JSON.stringify(portfolio, null, 2)}\n`);
};

const invokedPath = process.argv[1];

if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  generate();
}

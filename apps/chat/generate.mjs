import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = join(here, "..", "frontend", "src", "content");
const outFile = join(here, "src", "lambda", "utils", "portfolio.generated.json");

const NAME = "Zou Minowa";
const HEADLINE = "Software engineer focused on maintainable, well tested products.";

const readCollection = (name) => {
  const dir = join(contentDir, name);

  return readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => matter(readFileSync(join(dir, file), "utf8")));
};

const toProject = ({ data, content }) => {
  const project = {
    title: data.title,
    description: data.description,
    tags: data.tags ?? [],
    body: content.trim(),
  };

  data.link && (project.link = data.link);
  data.github && (project.github = data.github);

  return project;
};

const formatDate = (date) => (date instanceof Date ? date.toISOString().slice(0, 10) : String(date));

const toJournalEntry = ({ data, content }) => ({
  title: data.title,
  description: data.description,
  tags: data.tags ?? [],
  date: formatDate(data.date),
  body: content.trim(),
});

const portfolio = {
  name: NAME,
  headline: HEADLINE,
  projects: readCollection("projects").map(toProject),
  journal: readCollection("journal").map(toJournalEntry),
};

writeFileSync(outFile, `${JSON.stringify(portfolio, null, 2)}\n`);

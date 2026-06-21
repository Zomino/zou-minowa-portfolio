import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  tags: z.array(z.string()).min(1),
  titleJa: z.string().optional(),
});

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.md" }),
  schema: ({ image }) =>
    baseSchema.extend({
      link: z.string().url(),
      github: z.string().url(),
      image: image(),
      type: z.enum(["work", "personal"]),
      featured: z.boolean().default(false),
    }),
});

const journal = defineCollection({
  loader: glob({ base: "./src/content/journal", pattern: "**/*.md" }),
  schema: baseSchema,
});

export const collections = { projects, journal };

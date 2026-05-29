import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.md" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      link: z.string().url(),
      github: z.string().url(),
      image: image(),
      tech: z.array(z.string()).min(1),
      type: z.enum(["work", "personal"]),
      date: z.date(),
      featured: z.boolean().default(false),
      titleJa: z.string().optional(),
    }),
});

export const collections = { projects };

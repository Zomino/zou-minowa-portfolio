import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const pages = defineCollection({
  loader: glob({ base: "./src/content/pages", pattern: "**/*.md" }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      intro: z.string().optional(),
      aboutSections: z
        .object({
          strengthsHeading: z.string(),
          employmentHeading: z.string(),
          outsideWorkHeading: z.string(),
          outsideWorkParagraphs: z.array(z.string()).min(1),
        })
        .optional(),
      navLink: z.boolean().optional(),
    }),
});

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
    }),
});

const employment = defineCollection({
  loader: glob({ base: "./src/content/employment", pattern: "**/*.md" }),
  schema: () =>
    z.object({
      company: z.string(),
      role: z.string(),
      startDate: z.date(),
      endDate: z.date().optional(),
      tech: z.array(z.string()).min(1),
    }),
});

const strengths = defineCollection({
  loader: glob({ base: "./src/content/strengths", pattern: "**/*.md" }),
  schema: () =>
    z.object({
      title: z.string(),
      order: z.number().int().positive(),
    }),
});

export const collections = { pages, projects, employment, strengths };

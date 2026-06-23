import { describe, expect, it } from "vitest";
import { buildSoftwareSourceCodeJsonLd } from "./buildSoftwareSourceCodeJsonLd";

const project = {
  data: {
    title: "Painter Portfolio",
    description: "A portfolio website for my father, a painter.",
    link: "https://www.daisukeminowa.com/",
    github: "https://github.com/Zomino/daisuke-minowa-website",
    tags: ["Next.js", "TypeScript"],
    date: new Date("2025-05-31"),
  },
};

describe("buildSoftwareSourceCodeJsonLd", () => {
  it("builds a SoftwareSourceCode schema from project frontmatter", () => {
    const result = buildSoftwareSourceCodeJsonLd(
      "https://zouminowa.com/",
      project,
      "Zou Minowa",
    );

    expect(result).toEqual({
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: "Painter Portfolio",
      description: "A portfolio website for my father, a painter.",
      url: "https://www.daisukeminowa.com/",
      codeRepository: "https://github.com/Zomino/daisuke-minowa-website",
      keywords: ["Next.js", "TypeScript"],
      dateCreated: "2025-05-31",
      author: {
        "@type": "Person",
        name: "Zou Minowa",
        url: "https://zouminowa.com/",
      },
    });
  });
});

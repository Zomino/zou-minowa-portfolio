import { describe, expect, it } from "vitest";
import { buildPersonJsonLd } from "./buildPersonJsonLd";

const metadata = {
  siteTitle: "Zou Minowa",
  siteDescription: "London-based software engineer.",
  jobTitle: "Fullstack Software Engineer",
  email: "zouminowa@gmail.com",
  github: "https://github.com/Zomino",
  linkedin: "https://www.linkedin.com/in/zouminowa/",
  skills: ["TypeScript", "React"],
};

describe("buildPersonJsonLd", () => {
  it("builds a Person schema with identity from metadata and url from the site", () => {
    const result = buildPersonJsonLd("https://zouminowa.com/", metadata);

    expect(result).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Zou Minowa",
      jobTitle: "Fullstack Software Engineer",
      description: "London-based software engineer.",
      url: "https://zouminowa.com/",
      email: "zouminowa@gmail.com",
      sameAs: [
        "https://github.com/Zomino",
        "https://www.linkedin.com/in/zouminowa/",
      ],
      knowsAbout: ["TypeScript", "React"],
    });
  });
});

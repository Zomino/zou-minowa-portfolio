# AI Bot Optimisation

How to make a website's content readable by AI agents and AI-powered search engines. Covers the `llms.txt` standard, its companion files, and JSON-LD structured data.

---

## What It Is

Two complementary layers tell AI systems about a website:

- **`llms.txt`** — a Markdown file at the site root that acts as a curated index. AI agents fetch it to understand who you are and where to find key content, without crawling every page.
- **JSON-LD structured data** — machine-readable schema embedded in each page's `<head>`. Search AI (Google AI Overviews, Perplexity, Bing Copilot) uses this to extract entities such as a person, organisation, or software project.

Neither replaces the other. `llms.txt` serves agents that fetch your site on demand (e.g. a recruiter's AI assistant asked to summarise your profile). JSON-LD serves search engines that passively index your pages.

---

## Why It Matters

Without `llms.txt`, an AI agent asked about you must crawl your entire site, parse HTML, and synthesise the result itself. It may miss content, misattribute it, or hallucinate details. A well-formed `llms.txt` gives the agent authoritative, concise input with no crawling required.

Without JSON-LD, search AI treats your pages as unstructured text. Adding a `Person` schema with `sameAs` links to your GitHub and LinkedIn profiles lets search AI disambiguate you as a specific entity, which is the first step before it will cite you as a source.

---

## The `llms.txt` Spec

Defined at [llmstxt.org](https://llmstxt.org). The file lives at `https://yourdomain.com/llms.txt`.

### Format

```markdown
# Project or Person Name

> One to three sentence blockquote summarising who this is and what the site covers.

## Section Name

- [Page title](https://yourdomain.com/page): Brief description of what this page contains.
- [Another page](https://yourdomain.com/other): Brief description.

## Optional

- [Extended content](https://yourdomain.com/llms-full.txt): Full inline content for agents that need more detail.
```

### Rules

| Element | Required | Notes |
|---|---|---|
| H1 heading | Yes | Site or person name. Exactly one. |
| Blockquote summary | Recommended | Immediately after H1. The most important signal. |
| H2 sections | No | Group links by topic. |
| `Optional` section | No | Special keyword. Agents may skip it when context is limited. |

- Encoding: UTF-8, LF line endings, served as `text/plain; charset=utf-8`.
- Size: aim for under 50 KB and under 100 lines. The file should fit comfortably in any model's context alongside other inputs. If it does not, it defeats the purpose.
- Link format: `- [Title](URL): Description.` The description is what the agent reads to decide whether to fetch the linked page. Write it to answer the question "what will I find here?"

### What Agents Do With It

AI agents fetch `llms.txt` at inference time when a user asks about a site or person. They read the blockquote for a quick answer and follow links when they need more detail. Links in the `Optional` section are skipped when the agent is working within a tight context budget.

---

## `llms-full.txt`

Not formally part of the `llmstxt.org` spec, but a widely adopted convention. It is a companion file at `/llms-full.txt` that contains all site content inline, so an agent can get the complete picture in a single fetch without following any links.

The spec's own tooling generates equivalent files (`llms-ctx.txt` without optional sections, `llms-ctx-full.txt` with them), but most implementations simply publish a handwritten or build-time-generated `/llms-full.txt`.

**When to use it:** whenever the site has rich content that agents would benefit from reading in full. For a portfolio, this means the full text of every project page. Reference it from the `Optional` section of `llms.txt`.

**Size:** no formal limit. Unlike `llms.txt`, it is intended to be large. Agents fetch it deliberately when they want depth, so size is not a concern in the same way.

---

## JSON-LD Structured Data

Embedded in `<head>` as `<script type="application/ld+json">`. Parsed by search AI (Google, Bing, Perplexity) during indexing, not at user query time.

### Person Schema

Use on every page of a personal portfolio site. Tells search AI who the site belongs to and links your identity across platforms via `sameAs`.

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Your Name",
  "jobTitle": "Fullstack Software Engineer",
  "description": "One-sentence professional summary.",
  "url": "https://yourdomain.com",
  "email": "you@example.com",
  "sameAs": [
    "https://github.com/yourhandle",
    "https://www.linkedin.com/in/yourhandle/"
  ],
  "knowsAbout": ["TypeScript", "React", "AWS", "Accessibility"]
}
```

`sameAs` is the most important property for entity disambiguation. Without it, search AI may conflate you with other people who share your name.

### SoftwareSourceCode Schema

Use on individual project pages. Tells search AI what each project is, what technology it uses, and where to find the code and live site.

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Project Title",
  "description": "One-sentence description.",
  "url": "https://live-site.com",
  "codeRepository": "https://github.com/you/repo",
  "programmingLanguage": ["TypeScript", "React"],
  "dateCreated": "2025-05-31",
  "author": {
    "@type": "Person",
    "name": "Your Name",
    "url": "https://yourdomain.com"
  }
}
```

`SoftwareSourceCode` is a subtype of `CreativeWork` with fields specific to code projects (`codeRepository`, `programmingLanguage`). Use it in preference to the generic `CreativeWork` type for software.

---

## robots.txt

Add a `Sitemap:` directive so crawlers can find your sitemap without guessing the path:

```
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml
```

If your sitemap is already generated (e.g. by `@astrojs/sitemap`), this is the only change needed.

---

## Sources

- [llmstxt.org — official specification](https://llmstxt.org)
- [llms.txt Specification v1.7.0 — ai-visibility.org.uk](https://www.ai-visibility.org.uk/specifications/llms-txt/)
- [schema.org/Person](https://schema.org/Person)
- [schema.org/SoftwareSourceCode](https://schema.org/SoftwareSourceCode)
- [schema.org/CreativeWork](https://schema.org/CreativeWork)
- [llms.txt Explained — codersera.com](https://codersera.com/blog/llms-txt-complete-guide-2026/)
- [What Is llms-full.txt — aioseo.com](https://aioseo.com/what-is-llms-full-txt/)
- [Structured Data for AI Search — stackmatix.com](https://www.stackmatix.com/blog/structured-data-ai-search)

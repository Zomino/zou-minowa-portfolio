---
name: journal-entry
description: Use when writing or editing a journal entry in apps/frontend/src/content/journal/
---

# Journal entries

## File and frontmatter

One markdown file in `apps/frontend/src/content/journal/`. The filename becomes the URL slug, so name it for the final topic, not the working title.

```yaml
---
title: Title Case English Title
description: One or two short sentences for the listing page.
date: YYYY-MM-DD
tags:
  - AI-assisted development
titleJa: 日本語タイトル(brand名は大文字、例 VERCEL)
---
```

## Structure

- Short untitled intro paragraph, then `##` sections, one idea each.
- Keep the whole entry around a two minute read unless asked otherwise.
- End with a short `## In short` or `## Conclusion` section that ties the sections together.
- One diagram per section where visuals help, placed at the end of the section text: `![meaningful alt text](/diagrams/<name>.svg)`. See the d2-diagrams skill.

## Style checklist

- First person or impersonal; never second person.
- No hyphens or dashes as punctuation.
- No colons within sentences; colons only introduce lists.
- No comma splices or casual elliptical commas ("Nothing revolutionary, just..."). Complete grammatical sentences.
- British English spelling.
- Plain vocabulary over idioms the user has rejected (e.g. "a different story").
- Consistent contractions; the existing entries avoid them.

## Verify

Run Prettier on the file, then `pnpm -F frontend build` to validate frontmatter against the content schema.

---
name: write-journal-entry
description: >
  Turn a spoken or written stream of consciousness into a structured first draft of a
  Journal entry (a semi professional opinion or thoughts piece), saved to
  frontend/src/content/journal/. Use when the user says "write a journal entry",
  "new journal post", "I want to write up my thoughts on X", or starts talking through
  an opinion they want drafted. The output is a draft for the user to edit, not a finished article.
---

## What this is

The user thinks out loud, often messily and at length. Your job is to turn that raw input into a
clean, structured first draft **in their voice**, then hand it back for them to refine. You are a
ghostwriter, not the author. The opinions, claims, and conclusions are theirs; never invent
positions, evidence, or experience they did not give you.

## Process

1. **Take the brain dump.** Let the user talk or paste. Do not interrupt to tidy grammar. When they
   are done, work from everything they said.
2. **Find the spine.** Identify the single thesis and the 2 to 4 supporting points. Lead the draft
   with the point, then the explanation (point first, never bury it).
3. **Draft the structure** (flexible default for an opinion piece):
   - Short intro: the concrete context (what prompted this) plus the thesis in one or two sentences.
   - Body sections under `##` / `###` headings, one per point. If the piece answers objections, an
     "Addressing the concerns" style section works well, followed by a "The benefits" style section.
   - A very short conclusion (`## In short` or similar), two sentences at most.
4. **Apply the voice rules** below to every line.
5. **Write the frontmatter** (see spec) and save to
   `frontend/src/content/journal/<kebab-case-slug>.md`. Strip any leading `# Title` from the body;
   the title comes from frontmatter.
6. **Hand it back.** Tell the user it is a first draft and expect heavy editing. The dev server does
   not hot reload markdown content, so restart it to preview changes.

## Voice rules (this is the whole point of the skill)

These are distilled from repeated corrections. Default AI prose violates almost all of them.

**It is opinion, not fact.** This is the most important rule and the one most often broken.
- Frame claims as the user's view: "I think", "in my experience", "I would argue", "to my mind".
- Soften strong verbs: "it can encourage" not "it encourages"; "more reasonable than ever" not
  "has never been lower"; avoid "cannot be overstated" style absolutes unless the user insists.
- Never state an opinion as if it were established fact.

**Do not sound like a veteran.** The user is not a senior engineer with decades of experience and
does not want to sound like one.
- Ground claims in their own, often single, experience. Do not generalise to "teams always" or
  imply broad cross company experience. "On the codebase I work on" beats "When working on large
  codebases over the years".
- But do not over qualify either. Plain first person observation is usually right.

**Plain and tight.** Cut waffle ruthlessly.
- Remove filler: "wholeheartedly", "genuine", "a thing that exists", "the act of", "really", "just".
- Prefer short, direct sentences. When asked to shorten, hit the exact count (one sentence means one).
- One idea per sentence; recast dangling or run on structures rather than patching them.

**No repetition.** Watch for the same word twice in a sentence or nearby (e.g. "which ... which",
"thinking about ... thinking about", a noun repeated across adjacent sentences). Vary or cut.

**Measured and humble, never preachy or condescending.**
- Acknowledge opposing views fairly: "these are fair points", "I can see where they are coming from".
- Cut lecturing lines ("if we let that reaction win, we do not grow as developers").
- Describe other people's objections neutrally; never bad mouth colleagues, teams, or the employer.

**No second person.** Avoid addressing "you". Use first person ("I", "we") or impersonal phrasing.

**Not novel where it is not.** If an idea is long established, say so plainly ("this is an old
argument for X") rather than presenting it as the user's insight.

**Mechanics** (shared with the rest of the repo):
- British English: colour, optimise, behaviour, defence.
- No hyphens, em dashes, or en dashes as punctuation. Use commas or full stops. (Compound words
  like "trade-off" are fine.)
- Concrete and specific: name real tools and real numbers the user gave you.

## Frontmatter spec

```yaml
---
title: <plain sentence, the user's framing, not clickbait>
description: <one short plain sentence; used for the list page and meta description>
date: <YYYY-MM-DD, today unless the user says otherwise>
tags:
  - <Title Case, 3 to 6, most relevant first>
titleJa: <Japanese title or short phrase; drives the vertical wordmark on the detail page>
---
```

- `tags` must have at least one. Title Case. Order by relevance, not alphabetically.
- `titleJa` is a natural Japanese rendering of the title or topic, not a literal word for word
  translation. Keep it short; it renders vertically. Offer the user options and confirm.

## PII and safety check

Before finishing, scan for anything the user would not want public: names, emails, repo or ticket
IDs, customer data, or anything that disparages a named person, team, or employer. The piece may be
clearly tied to the user's employer, so flag (do not silently change) any sentence that exposes
internal process or sensitive detail, and let the user decide.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Stating the user's opinion as fact | Hedge: "I think", "in my experience", soften the verb |
| Sounding authoritative or widely experienced | Ground in the user's own, often single, experience |
| Waffle and filler words | Cut to the plain version |
| Burying the point mid paragraph | Lead with the point, then explain |
| Repeated words near each other | Vary or remove one |
| Lecturing or dunking on people who disagree | Acknowledge fairly, describe objections neutrally |
| Writing a finished article | It is a first draft; hand back for editing |

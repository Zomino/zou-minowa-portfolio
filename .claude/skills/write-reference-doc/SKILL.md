---
name: write-reference-doc
description: >
  Research and write a factual reference document on a technical topic, saved to docs/reference/.
  Use when the user asks to "create a reference doc", "document X for reference", "put X into
  the reference folder", or wants a technical concept explained and saved.
---

## Process

1. **Clarify scope** before searching. Ask as many questions as needed to understand the topic,
   audience, depth, and any constraints. Do not start research until scope is confirmed.

2. **Search the web** across multiple angles: definition, key metrics/methods, quantitative data
   with sources, best practices. Run searches in parallel. Cross-reference any statistic against
   at least one independent source before including it.

3. **Write the doc** to `docs/reference/<kebab-case-topic>.md`:
   - Target: 700-1000 words, ~5 min read
   - Sections: what it is, why it matters (real figures only), core concepts, key metrics/thresholds, principles, sources
   - Omit sections that have no real content for the topic
   - Use tables for structured comparisons
   - End with a sources list (one line per source with URL)

4. **Writing rules** (non-negotiable):
   - British English (colour, optimise, behaviour)
   - No em dashes or en dashes as punctuation. Use commas or full stops.
   - No evocative language. Facts only.
   - No hedging unless genuinely uncertain.
   - Never include specific prices, quotas, or instance counts (e.g. "$0.005 per path", "450 edge locations", "first 1,000 free"). These go out of date. Link to the relevant AWS pricing page instead.
   - Every feature, setting, or concept must explain **why it exists or why it matters** — not just what it does. A reader should understand the consequence of getting it wrong or skipping it. "This maximises cache hits" is not enough; explain what fewer cache hits costs (latency, origin load, money). "Set Min TTL to 0" is not enough; explain what happens if you don't.

---
name: imports
description: Import grouping and ordering rules for TypeScript, TSX, and Astro frontmatter. Use when writing or editing imports.
---

# Import order

In `.ts` and Astro frontmatter (between `---` fences), group `import` lines in this order:

1. **File-level directives** (for example `// @vitest-environment jsdom`) stay above all imports when the tool requires it.

2. **Side-effect imports** (forms like `import "some/module"` with no bindings). Own block directly under directives. One blank line after this block.

3. **Libraries** (bare module specifiers: `clsx`, `astro/container`, `vitest`, and so on).

4. **Parent-relative imports** (paths starting with `../`, and path aliases such as `@/` that resolve outside the current file's directory).

5. **Same directory and below** (paths starting with `./`).

## Rules for the whole import section

- **Between blocks:** use a single blank line between consecutive blocks 2 through 5.
- **Within each block:** sort lines by module specifier; when you edit a line, sort its named bindings too.
- **Type before value (blocks 3–5):** place every `import type` line before value imports in that block, with no blank line between those two groups.

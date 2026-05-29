---
name: testing
description: Vitest testing patterns and conventions for Astro components. Use when writing or editing tests.
---

# Testing guide

Conventions for Vitest in this repo. Run tests with `pnpm test`.

## Where tests live

Put each unit in its **own folder named after that unit**, with the implementation and test sharing the same basename.

```text
Badge/
├── Badge.astro
└── Badge.test.ts
```

## Astro components (`.astro`)

Use [Astro Container](https://docs.astro.build/en/reference/container-reference/) to render to HTML and assert on the string.

```ts
import { experimental_AstroContainer as AstroContainer } from "astro/container";

const container = await AstroContainer.create();
const html = await container.renderToString(Component, {
  props: {
    /* ... */
  },
  slots: { default: "..." /* named slots */ },
});

expect(html).toContain("...");
```

- Pass **`props`** for component props; pass **`slots`** as a map (`default`, named slots) with string or HTML snippet content as needed.
- Use `expect(html).toContain(...)` for visible text, important classes, `aria-*`, `data-*`, or attributes. Avoid snapshotting entire documents unless there is a strong reason.

**Reference tests:**

- `src/components/common/Badge/Badge.test.ts`
- `src/components/layouts/BaseLayout/components/Copyright/Copyright.test.ts`

## Test style

- **Cases:** Prefer small, focused `it` blocks. Each should cover one behavior or variant.
- **Mocks:** Define mocks only in the test or small `describe` block that needs them. Stub the smallest surface the code under test uses, and avoid shared mock factories, global defaults, and elaborate fake objects unless they are truly necessary.
- **Readability:** Phrase names and assertions around observable behavior (what shows up, what the user can do). Do not rely on implementation details unless that detail is explicitly part of the contract.
- **Composition:** Assert wiring, slots, and structure for this component only. Leave behavior that belongs to children to their own tests.
- **Types:** Do not use type assertions or TypeScript workarounds solely to make test code typecheck or run. Prefer simpler inputs, corrections in source types, or `expectTypeOf` when verifying types is the goal.

## Config

Vitest uses Astro's Vite config:

```ts
/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({});
```

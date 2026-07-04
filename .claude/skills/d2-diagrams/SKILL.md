---
name: d2-diagrams
description: Use when creating or editing D2 diagrams for the site (src/diagrams/*.d2 rendered to public/diagrams/*.svg)
---

# D2 diagrams

## Workflow

Sources live in `apps/frontend/src/diagrams/<name>.d2` and render to `apps/frontend/public/diagrams/<name>.svg`. Render inside the dev container:

```bash
docker exec -u node -w /workspaces/zou-minowa-portfolio/<checkout>/apps/frontend zou-minowa-portfolio-dev d2 [--layout elk] [--scale N] src/diagrams/<name>.d2 public/diagrams/<name>.svg
```

Every diagram starts with `style.fill: transparent`. Reference from markdown as `/diagrams/<name>.svg` with meaningful alt text.

## Sizing

- The page displays SVGs at intrinsic size, capped at column width. Control display size with `--scale`.
- Baseline is roughly 400px intrinsic height per diagram. Full width means rendering at scale 1.
- Check output dimensions with `grep -o -m1 'width="[0-9]*" height="[0-9]*"' <svg>`.

## Layout engine gotchas

- Fixed `width`/`height` on containers requires `--layout elk`. Dagre errors on it. Leaf shapes accept dimensions on both engines.
- `direction` inside a container is ignored by both bundled engines. To stack children vertically, use `grid-columns: 1` with `grid-gap`.
- `top`/`left` locked positions require the proprietary TALA engine, which is not installed. Circular layouts are not possible.
- Sequence diagrams (`shape: sequence_diagram`) are vertical only.
- Do not wrap siblings in an invisible grid container to align them; edges into grid children route badly. Use ELK, which aligns same rank nodes at the top.

## Matching box sizes

ELK enforces minimums from label widths and adds its own padding, so fixed dimensions are a starting point, not a guarantee. Iterate: render, measure actual rects with `grep -o '<rect x="[0-9.]*" y="[0-9.]*" width="..." height="..."' <svg>`, compute the padding delta, adjust, repeat. Expect a couple of pixels of ELK rounding that cannot be eliminated.

## Useful styling

- `label.near: top-center` puts a container label inside the box.
- `style.multiple: true` draws a stacked pile (good for files).
- `shape: document` / `hexagon` / `cylinder` distinguish artefact types.
- Messy or informal look: `style.stroke-dash: 4` plus `style.fill-pattern: lines`. Define once under `classes:` and apply with `class:`.
- Thicker arrow for emphasis: `style.stroke-width: 8` on the edge.

## Verifying

Browsers cache SVGs aggressively. Confirm the dev server serves the new file by comparing `curl -s <url> | md5` with `md5 -q <file>`, then hard refresh. After any visual change, take a screenshot of the rendered page and inspect it before reporting done.

# Render-blocking font imports

## What it is

A render-blocking resource is a file the browser must download, parse, and apply
before it can paint any pixels. CSS is render-blocking by default: the browser
will not show content while a stylesheet referenced in the `<head>` is still
loading, because that stylesheet could restyle everything already on screen.

This project shipped a worst-case version of the pattern. `src/styles/global.css`
opened with:

```css
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600;700&display=swap");
@import "tailwindcss";
```

That single line is the cause of the poor web vitals. It puts a third-party,
render-blocking network request on the critical path, and chains several more
behind it.

## Why it matters

A CSS `@import` is downloaded sequentially, not in parallel. When the browser
fetches the bundled stylesheet, it must download and parse the whole file before
it discovers the `@import`, and only then can it request the imported sheet. The
two files load one after the other instead of together. The longer the import
chain, the longer the page stays blank.

The chain here is deep:

1. Browser downloads the bundled site CSS (render-blocking).
2. It parses the CSS and finds the `@import` for `fonts.googleapis.com`.
3. It opens a brand new connection to `fonts.googleapis.com`, paying DNS lookup,
   TCP handshake, and TLS negotiation, then downloads that CSS (also
   render-blocking).
4. That CSS references font files on a second origin, `fonts.gstatic.com`,
   triggering another cold connection and more downloads.

A performance trace of the homepage confirmed the Google Fonts stylesheet loads
at `VeryHigh` priority, marked render-blocking, initiated directly by the
document, and that it fans out to four separate `fonts.gstatic.com` woff2 files.
The trace also reported "no origins were preconnected", so each third-party
origin is reached cold.

Two further costs make this worse than a generic blocking stylesheet:

- **Heavy CJK font.** Noto Serif JP is a Japanese serif family. Full CJK fonts
  are an order of magnitude larger than Latin fonts, which is why Google splits
  it into many unicode-range subset files. The site content is almost entirely
  English, with Japanese used only for the decorative `簑輪象` watermark, so most
  of that download is unused on most views.
- **Layout shift risk.** `--font-serif` sets Noto Serif JP as the default body
  font. With `display=swap`, text first renders in the fallback serif, then
  reflows when the web font arrives. If the two fonts have different metrics this
  moves content and raises Cumulative Layout Shift.

Adding a `preconnect` to `fonts.gstatic.com` alone can cut roughly 100 ms by
running DNS, TCP, and TLS in parallel with the initial request rather than after
it. Removing the import chain entirely removes far more.

## Core fix: self-host with the Astro Fonts API

The durable fix is to stop loading fonts from a third-party origin at request
time. Astro 5.18 ships a fonts feature that downloads font files at build time,
serves them from your own origin, generates optimised `@font-face` rules, and
emits preload hints. Self-hosting removes the cross-origin connections and the
import chain in one step, because the font CSS is no longer a separate
render-blocking request to another domain.

Enable it in `astro.config.mjs`:

```js
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  experimental: {
    fonts: [
      {
        name: "Noto Serif JP",
        cssVariable: "--font-noto-jp",
        provider: fontProviders.google(),
        weights: [400, 600, 700],
        styles: ["normal"],
        subsets: ["latin", "japanese"],
        fallbacks: ["serif"],
        optimizedFallbacks: false,
        display: "optional",
      },
    ],
  },
});
```

Render the font in the layout `<head>`, then point the Tailwind theme variable
at the one the Fonts API injects:

```astro
---
import { Font } from "astro:assets";
---
<Font cssVariable="--font-noto-jp" />
```

```css
@theme {
  --font-serif: var(--font-noto-jp), serif;
}
```

Then delete the `@import url(...)` line from `global.css`. The render-blocking
cross-origin chain is now gone, which is the change that actually fixes the web
vitals.

## Two gotchas specific to self-hosting a CJK font

These cost real debugging time. Both are caused by the font being CJK.

### Do not preload a CJK font

Preloading the above-the-fold font normally helps, but a CJK family is split into
many unicode-range chunks. Noto Serif JP's Latin coverage alone resolves to
hundreds of `@font-face` slices, so `<Font preload />` (or even a `subset: "latin"`
preload filter) emits hundreds of `<link rel="preload">` tags. That floods the
network and is far worse than the problem it solves. Leave preload off and rely on
`font-display` instead.

### Disable optimised fallbacks

Astro's `optimizedFallbacks` (on by default) generates a fallback `@font-face`
with a `size-adjust` derived from the font's average glyph width, so the fallback
occupies the same space as the web font. For a CJK font that average is dominated
by full-width characters, so the computed value is wrong for Latin text. In
practice it produced `size-adjust: 217%`, meaning the Latin fallback rendered at
2.17x size before the web font loaded: a flash of giant text on every cold load.
Set `optimizedFallbacks: false` so no bogus `size-adjust` is generated.

### Use `font-display: optional` to avoid the swap

Even without the size bug, swapping the fallback serif for Noto Serif JP causes a
visible reflow as the text re-lays-out (the "one font loads, then another loads
over it" effect). `font-display: optional` gives the font a short block period,
then either uses it (if already loaded) or keeps the fallback for that page load
with no swap. The result is no flash and no layout shift. A same-origin
self-hosted font usually loads inside the block window, so returning visitors see
the intended font immediately.

## Note on the dev server

`astro dev` injects CSS via JavaScript after the initial HTML, so you may see a
brief unstyled flash that settles. This is a dev-only artifact. Verify font and
layout behaviour against the production build (`astro build` + `astro preview`),
where the stylesheet is in `<head>` and there is no such flash.

## If the CJK payload matters

Keeping the full family is the heaviest option: the Japanese subset is many
unicode-range chunks (the browser still only downloads the chunks for glyphs on
each page, so per-page transfer stays small, but the inline `@font-face`
declarations add weight to every HTML document). Lighter alternatives, if the look
can flex:

| Option | Effect | Cost |
| --- | --- | --- |
| System CJK stack (e.g. mincho) for Japanese | No download for Japanese text | Look varies by OS |
| Self-host, glyph subset via `experimental.glyphs` | Tiny inline `@font-face` | Must list glyphs; brittle with dynamic content |
| Self-host full family (current) | Consistent look, dynamic-safe | Heaviest inline declarations |

## Principles

- Never load CSS or fonts via `@import` from a remote origin. It serialises the
  critical path. Use `<link>`, or self-host so there is no separate request.
- Keep render-blocking work on your own origin. Every third-party origin on the
  critical path adds a cold DNS, TCP, and TLS round trip.
- If you must use a third-party font host, `preconnect` to both
  `fonts.googleapis.com` and `fonts.gstatic.com`, and `preload` the critical
  font.
- Match fallback metrics with `size-adjust` and the `*-override` descriptors to
  stop `font-display: swap` from shifting layout.
- Ship only the weights, styles, and character subsets the page actually uses.

## Sources

- [What is CSS @import and why can it slow down websites? - DebugBear](https://www.debugbear.com/blog/avoid-css-import)
- [How to eliminate render-blocking requests - DebugBear](https://www.debugbear.com/blog/render-blocking-resources)
- [Critical rendering path - MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path)
- [Best practices for fonts - web.dev](https://web.dev/articles/font-best-practices)
- [Faster Google Fonts with preconnect - CDN Planet](https://www.cdnplanet.com/blog/faster-google-webfonts-preconnect/)
- [Preload web fonts for better Core Web Vitals - DebugBear](https://www.debugbear.com/blog/preload-web-fonts)
- [Using custom fonts - Astro docs](https://docs.astro.build/en/guides/fonts/)

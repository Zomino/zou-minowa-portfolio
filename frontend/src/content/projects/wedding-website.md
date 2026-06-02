---
title: Wedding Website
description: A bilingual wedding website with a pre-wedding photo gallery.
link: https://angela-and-zou.netlify.app/
github: https://github.com/Zomino/wedding-website
image: ../../assets/projects/wedding-website.png
tech:
  - Gatsby
  - TypeScript
  - Tailwind CSS
  - Headless UI
  - i18n
  - AWS S3
  - Netlify
type: personal
date: 2024-07-14
featured: true
titleJa: 結婚式のウェブ招待状
---

## Background

When my wife and I were planning our wedding, I wanted to avoid the expense of printing nearly a hundred invitation cards, so I decided to build a website instead. In the end, we printed cards anyway, but I still learned quite a few new skills in the process.

It was the first personal project I actually deployed, and the first time I really thought seriously about web performance and accessibility.

## Highlights

### Performant

I chose Gatsby, a static site generator, because I imagined most guests would be on mobile, often on slower connections, and pre-rendered HTML would be the most reliable way to serve them quickly. Images are lazy-loaded with blurred placeholders, so the page feels fast even on the photo-heavy gallery. The final site scored 100% on Lighthouse performance. It was a shame not many people saw it in the end...

### Bilingual English and Chinese

The site runs in both English and Chinese, with separate URLs for each locale. The two versions differ in more than just language: date formats, addresses, and schedule details are all adapted for each. Chinese translation courtesy of my wife.

### Accessible

Accessibility was a deliberate focus from the start. I used Headless UI components with baked-in accessibility, and took care with semantic HTML and ARIA attributes so that keyboard-only users and screen readers both have a good experience. I tested both manually, and the site scored 100% on Lighthouse accessibility.

### Handcrafted

Every line of code was written by hand (sans boilerplate and library generated code), which seems almost unthinkable now in the age of AI!

### Help from family

The hero illustration was drawn by my father, [Daisuke Minowa](https://www.daisukeminowa.com/), who is an artist. I wanted it in his style, so I kept the brief deliberately loose: an elephant and a rabbit, simple, abstract. What came back was something I could not have done by myself, and it gave the site a personality it had been missing.

## Reflections and Learnings

### Figma before building

Before touching any code, I spent time in Figma exploring colour palettes and font pairings. This was not full wireframing, more lightweight visual prototyping, but it saved a lot of trial and error in the browser, and in retrospect it is something I should do more often.

### Accessibility changed how I write HTML

I had always cared about writing good HTML, but taking accessibility seriously gave me a much better understanding of why semantic tags like article, section, and heading matter. The way I now design and structure pages is also influenced by things like default tab order and ease of keyboard navigation.

### Dependency management is a skill

Some Gatsby dependencies had not been maintained and would not work on the latest release. I had never properly met a dependency conflict before, having always just run installs and upgrades without much thought. Resolving it meant pinning Gatsby to an older version and manually configuring packages until everything cooperated. It gave me a much deeper appreciation for dependency management.

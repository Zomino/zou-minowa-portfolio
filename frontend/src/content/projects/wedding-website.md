---
title: Wedding Website
description: A bilingual wedding website with a pre-wedding photo gallery.
link: https://66e881633fd2d30008d543d4--angela-and-zou.netlify.app/
github: https://github.com/Zomino/wedding-website
image: ../../assets/projects/wedding-website.png
tech:
  - Gatsby
  - TypeScript
  - Tailwind CSS
  - Headless UI
  - AWS S3
type: personal
date: 2024-11-23
featured: true
titleJa: 結婚式ウェブサイト
---

## Introduction

When my wife and I were planning our wedding, I wanted to avoid the expense of printing nearly a hundred invitation cards, so I decided to build a website instead. In the end, we printed cards anyway (my wife insisted), but I still learned quite a few new skills in the process.

This was the first personal project I actually deployed, and the first time I really thought seriously about performance and accessibility.

## The Process

I started in Figma, settling on a calm palette and a hand-drawn elephant and rabbit illustration to give the site some personality, then chose the tooling:

- **Gatsby and React** for a fast static site with the bilingual routing the guest list needed.
- **Tailwind CSS** for styling, kept consistent through a small set of design tokens.
- **Headless UI** for the interactive pieces, such as the menus and the language selector, so behaviour and styling stayed cleanly separated.
- **AWS S3** to host the photo gallery, with image optimisation handling the heavy lifting on load times.

Doing every part myself meant the work did not stop at writing components. I had to reason about hosting, builds, image pipelines, and deployment. When the final site scored 100% across the board on Lighthouse, accessibility included, it felt earned.

## Reflections and Learnings

### Accessibility changed how I write HTML

Accessibility was a deliberate focus from the start, not something bolted on at the end. I tested the site with a screen reader, with keyboard-only navigation, and with my computer's built-in voice control. Part of the motivation was frustration with the poor accessibility I had seen at work, and a determination to do it properly when it was my own.

That process genuinely changed how I think about markup. When you are not considering accessibility, it is easy to reach for divs and spans everywhere. Thinking about it seriously forces you towards semantic structure instead: sections, articles, headings, and a sensible page hierarchy. I came away suspecting that good websites look the way they do partly because good design and good semantic structure tend to reinforce each other.

### Every problem is the tip of an iceberg

The biggest lesson was about how learning actually happens on a solo project. When you hit a problem, that problem is only the tip of the iceberg. To fix it properly you have to build layers of understanding underneath it, and those layers are where the real learning lives.

This is why a small personal project teaches you far more than its size suggests. At work, someone else has usually set things up, and you only ever learn enough syntax to get by. You never really own the full picture. Owning the setup yourself, and watching it break, is where the depth comes from.

I felt this most acutely with package management. Some Gatsby dependencies had not been maintained and would not work on the latest release. I had never properly met a dependency conflict before, having always just run installs and upgrades without a second thought. Resolving it meant pinning Gatsby to an older version and manually configuring packages until everything cooperated. It was a formative experience that I later applied directly at work.

### The skills transferred almost immediately

What surprised me most was how quickly nearly everything I learned became relevant to my day job:

- **Tailwind**: my team adopted it not long after I had already shipped something with it.
- **Headless components**: introduced at work around the same time, and having built my own first was invaluable.
- **Image optimisation**: now under consideration at work, and already second nature to me.
- **Accessibility**: the team is now making a conscious effort, and I arrived with hands-on experience.

The scale of a project does not limit the scale of what you learn from it. The skills are transferable regardless.

### Worth biting off

The usual advice is not to bite off more than you can chew. Going in without knowing most of these technologies was daunting, and there is something to that warning. But doing it anyway was worth it. That very constraint, being out of my depth, is exactly what forced the deeper learning, and it convinced me to keep building personal projects whenever I have the time.

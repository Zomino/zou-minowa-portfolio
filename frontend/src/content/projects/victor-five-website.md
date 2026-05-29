---
title: Personal Trainer Website
description: A digital business card for Victor Five, a personal trainer.
link: https://www.victorfivecoaching.com/
github: https://github.com/Zomino/victor-five-website
image: ../../assets/projects/victor-five-website.png
tech:
  - Next.js
  - TypeScript
  - Mantine
  - Tailwind CSS
  - Resend
  - Sentry
  - Vercel
type: personal
date: 2025-08-23
featured: true
titleJa: パーソナルトレーナーのデジタル名刺
---

## Background

I built a digital business card for Victor Five, a personal trainer. The goal was to give him a more professional online presence beyond social media, since having only an Instagram account was not enough to stand out. A single, clean page he could point prospective clients to, with the essentials and a way to get in touch.

This was the first project I built for a professional, which shaped several of the decisions below.

## Highlights

### Understanding the requirement

I tried to apply lessons from [The Mom Test](https://www.momtestbook.com/) and [Start With Why](https://simonsinek.com/books/start-with-why), trying to understand what Victor was currently doing and struggling with rather than just asking what he wanted.

The most useful thing to come out of those conversations was that he described what he wanted as something like a "business card", and as soon as I heard that I knew exactly what was needed. Just having a website seemed to be the point, rather than the actual content of the site itself.

### Observability and Analytics

This was a site that could affect Victor's professional image, so I needed to be sure it was being monitored at all times.

- **Sentry** set up for error tracking. It sends a weekly email summary of user activity and any issues.
- **Vercel Speed Insights and Analytics** configured, showing visitor counts and the countries they come from.

### Leaning on pre-built software and services

Pre-built software and managed services sped the whole development process up enormously.

- **Mantine** (a React component library) made building the UI laughably easy.
- **Vercel** gave me CI/CD and analytics out of the box.
- **Resend** handled the emails, removing the need for a backend altogether.
- I had been dreading the observability setup, but **Vercel and the Sentry plugin** handled most of that too.

Once I actually sat down to do it, the build only took a couple of days, fast for the time, given I was still using autocomplete rather than AI agents.

## Reflections and Learnings

### Get something in front of the user quickly

Looking back, I think I took what I had learned from [The Mom Test](https://www.momtestbook.com/) and [Start With Why](https://simonsinek.com/books/start-with-why) too literally. I spent too much time worrying about how I was going to measure the impact before building, when there was nothing to compare it against in the first place. Victor was a one-man band, not a company with a metric baseline to refer to before starting.

What I should have done was build the bare minimum and then iterate in response to feedback from Victor. The site has now in fact been through a couple of iterations off the back of his feedback, so that should have been the approach from the start. I got too worried about not building the right thing, when I should have just built the simplest thing and iterated from there.

### Use managed services first, upgrade later

I spent too much time worrying about the different ways to build it. What I should have done is just reach for a low cost managed service and integrate with it in a way where the underlying implementation can be swapped out easily, then worry about upgrading later if the need ever actually arises.

---
title: This Portfolio
description: The site you are reading right now.
link: https://zouminowa.com
github: https://github.com/Zomino/zou-minowa-portfolio
image: ../../assets/projects/zou-minowa-portfolio.png
tags:
  - AI-assisted development
  - Claude Code
  - Astro
  - TypeScript
  - Tailwind CSS
  - ESLint
  - Vitest
  - Vercel
type: personal
date: 2026-05-29
featured: true
titleJa: ポートフォリオサイト
---

## Why I built it

I am a self-taught software engineer, so I wanted an easy way for people to see practical examples of what I can build. I do not have a STEM degree or a big name company on my CV, so the work has to speak for itself.

## The experiment: AI first

This time, I wanted to build a site with AI doing as much of the work as possible. The idea was to find ways of working with it that maximise productivity without sacrificing quality, and document the process.

## The process

### Choosing the technology

I deliberately started with no prior research and simply asked the agent which framework I should use. I told it to rely on web search rather than its training data, and I asked the same question to a couple of different LLMs just to give myself more confidence. After weighing up some options, Astro was its best pick.

I felt inclined to trust the decision in this case, because I had heard of Astro before and knew it to be a highly regarded framework.

### Learning the framework

At first I had the AI set everything up and explain concepts as it went. It worked, but my entire understanding of Astro was coming through the AI, and I could not tell whether what it told me was good practice, or how many gaps I had in my knowledge. So I paused and spent an evening on the official getting started course, and came back with far more confidence.

The official course might teach me the same material as the AI, but I trust it more, because the maintainers built it to teach the framework correctly and I trust it covers what they consider the core skills. With AI, I never quite feel sure. If something is a core part of your stack, I still feel it is worth learning it from a reputable source rather than using it blindly.

My opinion might change, however. I noticed that Astro has a documentation MCP server, so the AI can in fact draw from a reputable source. That kind of thing might make me trust it more for learning new frameworks, but for now I still feel safer doing the core learning the old way.

### Design

I had a specific feel in mind that I wanted to go for: minimalist, professional, reminiscent of Japanese writing paper and ink. I was particularly inspired by the labels on Japanese whisky bottles, with big kanji and an old paper feel to everything. I handed that brief to the AI and let it design from it.

It took a few iterations, but within about an hour I had something very close to how the website looks and feels now in its final form. It saved me an enormous amount of time and, honestly, produced something I could not have achieved on my own.

### Fast prototyping

Closely related to the design work, another thing AI was amazing at was getting something visible on the screen quickly, even when the code behind it was messy. I used it to prototype ideas fast and throw away the ones that were not worth pursuing. That replaced an old habit of mine, which was to deliberate for ages before writing anything. Now, if something looked good on screen, only then would I decide whether it was worth refactoring based on how complex the code was. For example, I had it add a React island (using Astro's island architecture) for the animated navigation, found it did not really work, and got rid of it immediately.

I did make an early mistake. I got too excited and tried to do too many things at once, and the codebase turned into a mess. I then spent a long time refactoring it back into a usable state. The lesson: start from a solid base and try one thing at a time. Commit the designs you are happy with as you go (or at least stage them), so the AI can change things freely without overwriting anything you wanted to keep.

### Decomposing a page into components

Once a page looked right, the next step was to clean the code up. Over time, I settled into a rhythm:

1. Write tests for the behaviour I wanted to keep.
2. Ask the AI what could be extracted into components, and agree on the abstractions together.
3. Decompose the page into components.
4. Repeat steps 1 to 3, breaking those components down towards the atomic level.
5. Look for reuse opportunities and iterate.

Tests, linting, and TypeScript made this possible. Every time the AI made a change, it would run all three to make sure nothing was broken.

There was still a lot of fiddly refactoring, and some designs proved so hard to turn into clean code that they had to be abandoned. I spent days, for instance, trying to get the AI to implement inner only grid borders in a clean way, the sort you see on a noughts and crosses (tic-tac-toe) board, where only the inside edges have lines. I never got it working the way I wanted, so eventually I let it go.

The overall result, however, is code I am extremely proud of. The lower level details that can make components hard to read are abstracted behind clean, well named APIs. As the codebase grew this way, the AI got noticeably better at inferring the existing patterns.

It is worth noting that while I think this works well for vibe engineering a static site, I am not sure how cleanly it would translate to a fullstack production application. The frontend and backend can be built in parallel, and the endpoints might not map neatly onto your design, which could make it harder to decompose things this way.

### Writing content

I use AI to do the first draft of every single project page's markdown, using the following steps:

1. Give the AI a link to the GitHub repo and ask it to summarise the architecture. This adds it to the AI's context and refreshes my own memory.
2. Tell the AI to visit the live site and take a screenshot of the exact content I want in the thumbnail, at the required dimensions.
3. Using a dictation tool, talk stream of consciousness to a separate AI about the project: why I built it, my thought process, the features, and what I learned.
4. Ask the AI to summarise all of that into a prompt.
5. Pass that prompt back to the original AI, which already has the project context and thumbnail, and ask it to write the markdown.

It still takes a lot longer after that, with me going back and tweaking things, but it would take an astronomically longer time if I did not have this first draft to build on. The AI also seems to get better the more entries I add, perhaps because there are more examples for it to learn from.

## Conclusion

Building this site AI first taught me a lot about where AI genuinely shines and where I still need to step in. It is an incredible tool for design and prototyping, but it still requires handholding when it comes to good engineering. These are the key lessons for me:

- For anything that is a core part of your stack, it is still worth learning it from a reputable source rather than trusting AI blindly (for now).
- AI is brilliant for design and for getting something on the screen fast. Prototype quickly, throw away what does not work, and save what you are happy with so the AI cannot overwrite it.
- Tests, linting, and TypeScript are what let the AI move fast and autonomously without breaking things.
- Do not fight the tool. When something is genuinely hard for the AI, it is probably better to let it go than to force it.
- AI is a huge time saver for writing, but it still takes a lot of effort afterwards to make it sound like something an given individual would actually say.

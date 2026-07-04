---
title: A Few Small Tricks for Working with Coding Agents
description: A handful of small habits that keep agents busy and me productive.
date: 2026-07-04
tags:
  - AI-assisted development
  - Coding agents
  - Workflow
  - Unit testing
titleJa: コーディングエージェントを効率よく使うコツ
---

None of these are anything groundbreaking. They are just small techniques I have picked up while working with coding agents. I mostly use Claude Code, but nothing here is specific to it.

## Work asynchronously

I try to structure my day to minimise the moments when I am sitting in front of a terminal with nothing running. My breaks tend to fall at predictable times, so I save long running tasks for lunch, coffee, and the end of the day, and set them off just before stepping away. The key is making sure the agent has all the permissions it needs to run unattended, so that I can come back to finished output and not a permission prompt.

## Split hard from easy

Running multiple agents at the same time is only efficient if I can keep up with them. A task that demands real attention does not leave much cognitive bandwidth for anything else, and I find running more than one such task at once to be counterproductive. Easy tasks, however, are a different matter. Anything an agent can handle without much intervention, such as a dependency upgrade, a small UI tweak, or a simple bug fix, can run happily on the side. So I split my work into one hard task that gets most of my attention and a stream of easy ones that tick along in the background. Keeping a list of the easy ones handy means there is always something to set off.

## Façade first

AI is very good at making something work and look right, and much less good at making the code clean, so I lean into its strengths. I vibe code the functionality end to end first, without worrying too much about the code, then take over and clean up from the outside in. The clean outer API is the façade, and everything behind it can stay messy until I get to it. This works well for three reasons. First, it gets something working quickly, so if I were pushed to ship under pressure, I could do so and tidy up afterwards, provided I was actually confident it was working. Second, it pairs beautifully with unit testing. I can put a clean API on the outside of the mess, write tests against that API once, and refactor freely underneath because the tests secure the boundary. Third, it tends to produce cleaner code. Carving components out of a wall of unreadable output follows the semantic groupings my own mind finds, and the final code ends up reading close to English. This technique shines for frontend work, but it applies to backend too.

## Contract first

Defining the contract first for a change that crosses service boundaries is nothing new. The difference with agents is that I can hand each side to a separate agent and build both at once instead of one at a time. It is not quite twice as fast, but it is significantly faster, and it is less cognitively taxing than normal multitasking because both halves belong to the same problem. For frontend tickets, this works especially well with a tool like Storybook. With types inferred from the contract and stories rendering the component in isolation, the UI can be built and tested before the backend exists.

## Give up on the bleeding edge

I used to insist on writing everything in the latest syntax and newest features of the languages I was working in. I have stopped forcing the AI to use them. An agent asked to do something will reach for the code it has seen most in its training data, and that syntax might be a little old, but if it works, it works. Spending extra effort pushing the agent towards the newest syntax just to have it is counterproductive, so I let it write what it knows best.

## Ask what can become a skill

At the end of a conversation, I always ask the AI whether anything from it could be turned into a skill or recorded in an instruction file such as CLAUDE.md or AGENTS.md. The whole back and forth up to that point is effectively a record of everything the AI could not do out of the box, because if one prompt had produced a perfect result first time, no skill would be needed. Distilling that into skills and instruction files makes the next session start further ahead.

## In short

Most of these boil down to two ideas. The agent should always be busy while my own attention goes to whatever needs it most, and it pays to work with what the AI is good at rather than against it.

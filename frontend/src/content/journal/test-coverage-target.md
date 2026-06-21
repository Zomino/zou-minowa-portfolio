---
title: Why I Think Aiming for a Test Coverage Target is a Good Thing
description: A defence of strict test coverage requirements.
date: 2026-06-20
tags:
  - Unit testing
  - SonarQube
  - CI/CD
  - TDD
  - AI-assisted development
titleJa: テストカバレッジ目標の利点
---

At work, we recently added an 80% unit test coverage requirement to our SonarQube security scans, and because that scan is a required check in our CI/CD pipeline, falling short now blocks a pull request from being merged. It immediately caused discomfort. The objections were that it is too much, that it slows everyone down, and that it forces engineers to write tests that do not test anything worthwhile, purely to hit a threshold.

These are fair points, and 80% is certainly high. But I think the benefits of setting a strict requirement and holding to it far outweigh the negatives, especially in the age of AI agents.

## Addressing the concerns

### Decrease in velocity

It does slow things down, but I would argue not by much. Agents are very good and very fast at writing tests, because tests are exactly the kind of repetitive, relatively simple code AI excels at producing. Personally I would say AI does a better job than I could myself, because it does not get tired of writing the same boilerplate, and can produce vastly more tests than I could in the same amount of time.

Agents also do not require full supervision while writing tests. If coverage is low, I can spin up a Git worktree, attach the SonarQube MCP server, and ask the agent to pull the security scan results into its context and write tests to satisfy the threshold. I can move on to something else, then skim the result afterwards to check the cases are reasonable. The time from the pipeline failing to it finally going green might be a while, but the time I actually spend prompting adds up to only a few minutes.

Even where it does cost time, such as when doing TDD and writing tests as part of development, I feel it is a trade-off worth making. Spending a little time prompting for robust test coverage is far preferable to an obscure bug reaching production through untested code. That kind of bug tends to surface in the middle of something else, forcing everything to stop, and gets fixed under pressure while users wait, which is far worse than the time spent up front. This is an old argument for unit testing, but now that AI writes the tests, the up-front cost is more reasonable than ever.

It is also worth remembering that this kind of friction is to be expected whenever we introduce a new tool that enforces code quality. TypeScript, Prettier, ESLint, and SonarQube all drew complaints when they were first introduced, from myself too in some cases, because they forced us to change the way we write code. But they all quietly became another part of the process as we discovered ways to work with them or tweaked the settings to suit our preferences. I expect test coverage to go the same way if we keep the target in place for long enough.

### Test quality

Sometimes the tests are weak. Prompting an agent to push a pull request from 73% up to 80% might produce some filler that does not mean much. But the bulk of the tests written to get there should be good ones, and that, I think, is what matters.

The filler is harmless in any case. The one real downside is the extra time the tests take to run, but modern test runners like Vitest execute tests extremely efficiently, so in practice I barely register a difference. A bad test does not cause bugs either; the worst it can do is fail for the wrong reason, at which point it gets fixed or deleted. More coverage should never cause a bug in production.

## The benefits

### Keeping pace with AI

The amount of code engineers can now produce is far greater than it was, and it follows that the amount that we must understand and maintain, as well as the number of bugs, will grow with it. I think this makes having an extensive unit test suite, effectively an executable specification, more important than ever.

For me, the greatest benefit unit tests offer in the age of AI is in code review, now widely agreed to be the new bottleneck. AI writes verbose, repetitive code that raises the cognitive load of reading it, and refactoring it down, though the ideal fix, is not something a pull request can enforce. Reviewing every line at the old level of granularity is also no longer realistic. Good test coverage offers another route. I can start by reviewing the test cases, which, being written in plain English, are much easier to understand than source code. If they are clear and the test file is clean, it gives me greater confidence that the function does what it claims, so I can focus on reviewing module structure and identifying code smells rather than the implementation details underneath.

Unit tests are also great as a way of allowing an agent to deterministically verify its own work. When iterating quickly with agents, it is difficult to tell whether a change has broken something, but a failing test provides that signal at once, allowing us to delegate more with greater confidence.

### The mindset shift

In my own experience, the most important thing the coverage requirement has done is force me to fix some of my bad habits as an engineer.

With no target to aim for and no accountability, I find that the code I write is very different from the code I write against a strict standard. Knowing there is a goal to reach makes me write tests alongside the code to avoid the pain of writing them all at the end. That is effectively TDD, widely considered to be a good thing.

The target also pushes me towards writing code that is easier to test in the first place. That means writing code with clearer boundaries, fewer responsibilities, and smaller files. These are all characteristics of clean, maintainable code.

I have also restructured the way I approach development as a result of the unit testing requirement. I like to experiment and rewrite often, and a bad habit of mine was to rewrite function APIs many times until I was happy with them. If a function I was iterating on had unit tests, I was forced to wait for the agent to rewrite all the tests every time I changed direction. This was time consuming and risky. The lesson was that the workflow itself was wrong. Writing the tests once and then refactoring freely underneath them is far smoother, and that requires defining clear boundaries and APIs up front. It also taught me to work from the big picture down rather than building inside out.

### Forcing the conversation

I believe the value of anything that shakes the team out of apathy and gets people engaging cannot be overstated. It is easy to grow comfortable with known problems and put them off indefinitely, and a hard requirement that causes discomfort is exactly the kind of thing that prompts people to start talking again. We have already had a few discussions on the topic where more engineers than usual had something to say, and that is valuable in itself.

## In short

I understand the worry that 80% is just a number, and without AI I would agree it is too high. With AI, however, writing the tests is no longer the slow part, so a hard target costs little, and in my opinion having any tests at all beats leaving it to each developer to decide how much coverage they want to provide, which will sometimes mean none at all. Just as valuable, I think, is the shift in mindset it can encourage, towards understanding the purpose of the code and how we produce it, which matters more now that writing functional code is no longer the hard part.

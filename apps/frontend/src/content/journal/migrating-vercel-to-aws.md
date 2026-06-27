---
title: Migrating from Vercel to AWS in a Weekend
description: Why the speed was not the point, and what made the migration both fast and genuinely educational.
date: 2026-06-25
tags:
  - AI-assisted development
  - Replatforming
  - AWS
  - IAC
  - CI/CD
  - Observability
  - DNS
titleJa: 一週末でVERCELからAWSへ移行
---

I recently migrated this portfolio site off Vercel hosting and onto AWS, replacing the platform features Vercel provides out of the box with equivalent AWS services. I leaned on AI heavily throughout, and managed to get the bulk of the work done in a single weekend.

![Architecture: Route53, ACM, and CloudFront serving from S3, GitHub Actions deploying, CloudWatch and RUM for monitoring, Firehose archiving logs to S3](/diagrams/architecture.svg)

The migration covered:

- Frontend serving from CloudFront with S3 backend.
- Infrastructure defined in Terraform.
- A CI/CD pipeline (GitHub Actions) with quality gates and preview environments.
- Monitoring, analytics, and logging rebuilt in CloudWatch.
- Long-term log archiving via Firehose into S3.
- DNS migration.

I also made a few improvements to the site itself:

- Added the Journal section you are reading now.
- Optimised the site for AI web crawlers.
- Improved performance and accessibility.

I am amazed at how much I got through. I use AI at work, but there the higher stakes and existing technical debt mean things take much longer.

What pleased me even more was that the pace did not come at the expense of understanding. I have experience with AWS and Terraform, and some with CI/CD, but I was setting up many of these services for the first time. While I would not claim to be an expert in any of them, I came away with a decent working understanding of them all despite only having spent a short time on each.

I think this comes down to a few deliberate choices, some that kept me moving fast and some that kept me understanding what I was building.

## Identifying boundaries and parallelising the work

I started by listing everything I needed to do and roughly working out the dependency order between the pieces. Alongside it I kept a second list of smaller, less cognitively taxing tasks.

Then I worked through the main list in dependency order, parallelising as much as I could across separate Git worktrees. Whenever I was waiting on agents to finish, I would shift my attention to one of the lighter tasks. I kept a minimum of two agents running at any one time, which let me get through much more in a shorter space of time.

## "Teach me in 5 minutes"

One thing that bothers me about AI is that when I ask it to explain something technical, it tends to go into far too much detail, producing a wall of text full of inline code snippets. That low level detail does not really help my understanding, and I would much rather have a higher level overview that is easier to take in.

The simple act of telling it to keep each explanation to a five minute read and stay high level worked brilliantly in keeping the output digestible. I used it for anything new to me or that I was rusty on, and eventually turned it into a skill to make it repeatable.

## Set up services manually, then import to Terraform

A bad habit of mine is to jump straight into Terraform to avoid the double work of learning a service in the AWS console and then learning the Terraform to reproduce it. But for me Terraform is a poor way to learn a cloud service as it is far less visual, and the concepts sink in faster when I set things up by hand.

Getting AI to give me step by step instructions to set things up in the AWS console, then having it produce the Terraform resources and imports afterwards, removed that double work. By the time I read the Terraform, it made complete sense, because I had just built the same thing manually.

This did lead to a slightly existential realisation that I had willingly reversed our roles, with the AI prompting me to do things rather than the other way around. But it works!

## Replicating a real migration

Along the same lines, I had the AI take me through the steps of a genuine migration rather than writing everything at once. None of this was strictly necessary, as this is only a portfolio site and taking it down for a couple of days would not have affected anyone, but I wanted the practice of performing a real DNS cut over with zero downtime.

I had it build the Terraform up slowly, stand the new CloudFront distribution up alongside the live Vercel site, add the CI/CD and observability, and only cut over at the very end.

## Conclusion

In short: AI fast, human slow. The real bottleneck is understanding what the AI is building and why, and most of what I did was about keeping that understanding within reach while moving fast.

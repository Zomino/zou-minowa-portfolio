---
title: Signal Stack
description: Realtime incident dashboard for triaging outages with alert routing.
link: https://signalstack.example.com
github: https://github.com/example/signal-stack
image: ../../assets/projects/signal-stack.svg
tech:
  - Astro
  - TypeScript
  - Tailwind
  - Supabase
date: 2025-11-08
featured: true
---

## Overview

Signal Stack focuses on _clear incident visibility_ and **repeatable response workflows** for distributed teams.

### Goals

- Reduce time-to-acknowledge for critical alerts.
- Keep responders aligned with a single source of truth.
- Make post-incident review painless and consistent.

### Key outcomes

1. Mean time to acknowledge dropped from 6 minutes to 90 seconds.
2. On-call handoffs became predictable and easier to audit.
3. Documentation gaps surfaced earlier in the incident flow.

## Process

### Discovery

We interviewed on-call rotations across three teams and mapped pain points around escalation, context switching, and follow-up.

#### Insights

- Alert storms caused _alert fatigue_ within minutes.
- Triage context lived across multiple tools.
- Handoffs lacked a shared, readable summary.

### Build

We shipped a structured incident timeline, a summary card, and a lightweight postmortem checklist.

## Features

- Incident timeline with tagged updates.
- Slack-friendly alert routing with context previews.
- Audit-ready postmortem notes.

## Architecture notes

The data flow uses a queue-based normalizer so alerts are consolidated before they hit the UI, keeping the timeline stable.

### Operational checklist

1. Validate alert payload schema.
2. Confirm routing rules for each service.
3. Run a synthetic incident drill.

### What changed

- Added a single-source incident snapshot.
- Introduced explicit severity thresholds.
- Documented ownership per alert source.

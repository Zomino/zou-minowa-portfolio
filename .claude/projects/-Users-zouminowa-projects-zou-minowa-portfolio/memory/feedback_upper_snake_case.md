---
name: UPPER_SNAKE_CASE scope
description: UPPER_SNAKE_CASE is for static literal values only — no computed/derived values. Arrays and objects of literals are fine.
type: feedback
---

Use UPPER_SNAKE_CASE for constants with static literal values — strings, numbers, arrays of literals, objects of literals. Do NOT use it for values derived from function calls or computations (e.g. `metadata.siteTitle.split(" ")`). Use camelCase for those.

**Why:** The user considers UPPER_SNAKE_CASE to mean "hardcoded, no calculation involved." Derived values should use camelCase even if they don't change.

**How to apply:** Before naming a const with UPPER_SNAKE_CASE, check if the right-hand side involves any function call or computation. If yes, use camelCase.

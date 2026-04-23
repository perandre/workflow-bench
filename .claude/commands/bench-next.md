---
description: Resume the bench after /clear — run the next platform
---

Resume a bench run that's in progress. The user just did `/clear` and needs the next platform to start.

## 1. Figure out where we are

```bash
cat platforms.json
ls services/*/scoring.md 2>/dev/null
cat workflow.md | head -5
```

Platforms list comes from `platforms.json`. A platform is "done" if `services/<slug>/scoring.md` exists. The next platform is the first in the list without a `scoring.md`.

## 2. If all platforms are done

Run the final comparison: read `COMPARE_PROMPT.md`, aggregate all `services/*/scoring.md`, write `summary.md`, and give the user a one-paragraph ranked recommendation in chat. Also update `COMPARISON.md` per the cumulative rules in `CLAUDE.md`. Done.

## 3. Otherwise — start the next platform

Read `ORCHESTRATE.md` "Before starting any platform" + "Per-platform execution" sections and execute them for the next platform. Re-read gotchas from `COMPARISON.md` for this platform before writing code.

One-line confirmation in chat: "Resuming with [platform]. [N] of [total] done." Then begin.

---
description: Weight scoring criteria, describe a typical flow, then get a top-3 recommendation grounded in the bench data.
---

# /bench-interview

Interactive weighting + recommendation. Goal: turn the user's priorities into an opinionated top-3 from the bench data already on disk.

## Phase 1 — Load criteria

Read COMPARISON.md and extract the row labels from the "Synthesized scores" table (all rows between `**Developer experience**` and the final 1–5 row immediately above the `**Weighted (...)**` summary row, inclusive). These are the criteria. Do NOT hardcode the list — it drifts.

Also note which platforms are currently in the active roster (columns of that table).

## Phase 2 — Ask one criterion at a time

For each criterion, ask exactly:

```
[N/total] <Criterion name>
Importance 1–5 (1 = don't care, 5 = critical). Reply with a number, or `skip`/`0` to ignore.
```

Rules:
- One question per message. Wait for the reply before asking the next.
- Accept `1`, `2`, `3`, `4`, `5`, `0`, or `skip`. Reject anything else with a one-line reprompt.
- Keep a running tally in your head (do not echo it each turn — too noisy).

## Phase 3 — Typical flow

After all criteria are weighted, ask:

```
Describe a typical flow in a few words (e.g. "fetch API, enrich, fan out, post to Slack, wait for approval").
```

Then match the description against `workflows/*.md` — pick the single closest spec by shape (triggers, steps, durable waits, fan-out, human-in-loop). If nothing matches well, say so and treat the description as flavor only.

## Phase 4 — Recommendation

Gather intel from:
- `COMPARISON.md` — scores, verdicts, gotchas, run log
- `services/*/scoring.md` — per-platform detail for any platform you're about to recommend
- `workflows/<matched>.md` — to sanity-check which platforms have actually run this shape
- `CLAUDE.md` — constraints (40+ devs, DX-first, local-only, self-hosted)

Compute a weighted score per active platform using the user's weights (ignore skipped criteria; don't renormalize silently — just note which were skipped). Use the numeric cells from the table; treat `?` or `—` as missing and call it out.

Output:

```
## Top 3 for your priorities

### 1. <Platform> — <weighted>/max
<2–3 sentences: why it wins for THIS weighting, tied to the specific criteria the user rated highly. Cite the matched workflow if the platform has run it.>
Watch out for: <top gotcha from COMPARISON.md>

### 2. <Platform> — ...
### 3. <Platform> — ...

## Honest caveats
- <Any criterion with missing data that materially affected ranking>
- <Any platform that would rank higher but hasn't run the matched workflow>
- <If the matched flow shape isn't well-represented in the bench, say so>
```

Be opinionated. If two platforms are within 2 points, say it's a tie and give the user the deciding factor (e.g. "Temporal if you'll self-host seriously, DBOS if you want Postgres-native"). Do not hedge everything.

## Rules

- Do NOT run the bench. This command is analysis-only.
- Do NOT modify COMPARISON.md or any scoring files.
- If COMPARISON.md is missing or the scores table can't be parsed, stop and tell the user.

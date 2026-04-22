# Compare Prompt — run once, after all four platforms are scored

Paste into a fresh Claude Code session from `~/Sites/workflow-bench/`.

You are aggregating four completed benchmark rubrics into a ranked comparison.

## Inputs
- `results/inngest/scoring.md`
- `results/trigger-dev/scoring.md`
- `results/hatchet/scoring.md`
- `results/restate/scoring.md`

## Your job

1. Read all four rubrics.
2. Produce `~/Sites/workflow-bench/comparison.md` with:
   - **Side-by-side table** — one column per platform, rows = rubric fields.
   - **Ranked recommendation** for a user whose spec is: *"code-first, self-host simple infra (Postgres-only ideal), standalone handler service, no user-facing app required, TypeScript-first."*
   - **Surprises** — anything a platform did noticeably better or worse than its earlier positioning predicted.
   - **Agent-tooling signal** — did the platforms with richer agent tooling (MCP/skills) produce measurably better code, or did all four converge? One paragraph.
   - **Variance caveat** — if the user ran any platform twice, note divergence between runs.

## Anti-bias guardrails

- Do not name a winner before writing the table. Fill the table first, rank after.
- If two platforms are within 1 point on every axis, call it a tie, not a ranked order.
- Flag any rubric field that was "not measured" — those are holes in the data, not neutral scores.
- If the surprise section is empty, write "no surprises" — don't manufacture drama.

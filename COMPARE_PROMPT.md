# Compare Prompt — run once, after all platforms are scored

Paste into a fresh Claude Code session from `~/Sites/workflow-bench/`.

You are aggregating completed benchmark rubrics into a ranked comparison.

## Inputs

Read `~/Sites/workflow-bench/platforms.json` to get the list of platforms that were benchmarked this run. For each platform `<P>`, read `services/<P>/scoring.md`.

Also read `~/Sites/workflow-bench/workflow.md` — the recommendation should be framed in terms of the workflow that was actually tested.

## Your job

1. Read all rubrics and each platform's `BENCH_LOG.json` (for timing and mode).
2. Update `~/Sites/workflow-bench/COMPARISON.md` — the living comparison table tracked in git. For each newly benchmarked platform:
   - Add or update its column
   - Fill the **Mode** row (`Installation included` or `Flow only`)
   - Fill the three timing rows from `BENCH_LOG.json` → `timing` (`installMinutes`, `buildMinutes`, `executionMinutes`). Write `—` if the mode means a timer doesn't apply (e.g. `installMinutes` is null for Flow only runs)
   - Score each of the 7 dimensions
   - Do not remove or overwrite existing platform columns
3. Produce `~/Sites/workflow-bench/summary.md` (gitignored) with the full narrative:
   - **Side-by-side table** — one column per platform, rows = rubric fields.
   - **Ranked recommendation** framed around the tested workflow — which platform handles this kind of workload best, and why?
   - **Surprises** — anything a platform did noticeably better or worse than its earlier positioning predicted.
   - **Agent-tooling signal** — did platforms with richer agent tooling (MCP/skills) produce measurably better code, or did all converge? One paragraph.
   - **Variance caveat** — if the user ran any platform twice, note divergence between runs.

## Anti-bias guardrails

- Do not name a winner before writing the table. Fill the table first, rank after.
- If two platforms are within 1 point on every axis, call it a tie, not a ranked order.
- Flag any rubric field that was "not measured" — those are holes in the data, not neutral scores.
- If the surprise section is empty, write "no surprises" — don't manufacture drama.

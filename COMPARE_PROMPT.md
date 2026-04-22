# Compare Prompt — run once, after all platforms are scored

Paste into a fresh Claude Code session from `~/Sites/workflow-bench/`.

You are aggregating completed benchmark rubrics into a ranked comparison.

## Inputs

Read `~/Sites/workflow-bench/platforms.json` to get the list of platforms that were benchmarked this run. For each platform `<P>`, read `services/<P>/scoring.md`.

Also read `~/Sites/workflow-bench/workflow.md` — the recommendation should be framed in terms of the workflow that was actually tested.

## Your job

1. Read all rubrics and each platform's `BENCH_LOG.json` (for timing and mode).
2. **Calculate weighted scores**: DX 40%, Reliability 30%, Operational 20%, Cost 10%. Each platform gets a final score out of 100.
3. Update `~/Sites/workflow-bench/COMPARISON.md` — the living comparison table tracked in git. For each newly benchmarked platform:
   - Add or update its column
   - Fill the **Mode** row, timing rows, and weighted score (0-100)
   - Do not remove or overwrite existing platform columns
4. Produce `~/Sites/workflow-bench/summary.md` (gitignored) with the full narrative:
   - **Weighted scoring table** — platform vs (DX%, Reliability%, Operational%, Cost%, **Total/100**)
   - **Clear recommendation** (for 40+ dev team) — one paragraph naming the winner and why. Focus on: *Can the team be productive? Will this scale? Is it a joy or a drag?*
   - **Trade-offs for runners-up** — one bullet per runner-up explaining what you gain/lose (e.g., "Hatchet: trade DX for observability visibility").
   - **Workflow-specific insights** — what did THIS workflow expose about each platform? (e.g., "ArXiv-to-Slack is simple enough that all platforms succeeded—DX differences are the real signal.")
   - **Surprises** — anything a platform did noticeably better or worse than expected.
   - **Agent-tooling signal** — did platforms with richer agent tooling (MCP/skills) produce measurably better code? One paragraph.

## Anti-bias guardrails

- Do not name a winner before writing the table. Fill the table first, rank after.
- If two platforms are within 1 point on every axis, call it a tie, not a ranked order.
- Flag any rubric field that was "not measured" — those are holes in the data, not neutral scores.
- If the surprise section is empty, write "no surprises" — don't manufacture drama.

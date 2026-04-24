# Compare Prompt — run once, after all platforms are scored

Paste into a fresh Claude Code session from `~/Sites/workflow-bench/`.

You are aggregating completed benchmark rubrics into a ranked comparison.

## Inputs

**Source of truth = scoring files on disk, not `platforms.json`.** `platforms.json` is only the active-run queue; it can diverge from reality (ad-hoc runs, orphan results, aborted runs). Relying on it has caused real drift — vercel-workflow was benched outside `platforms.json` and went missing from COMPARISON.md for an entire run cycle.

Collect inputs as follows:

1. `ls ~/Sites/workflow-bench/services/*/scoring.md` — every platform that has been scored (this run *or* any prior). Read all of them.
2. `ls ~/Sites/workflow-bench/services/*/mode.txt` — any dir with `mode.txt` but no `scoring.md` is an **incomplete run**. List it under `Incomplete runs` in `COMPARISON.md`; do not score it.
3. `~/Sites/workflow-bench/platforms.json` — the active-run queue. Use only to distinguish *new this run* from *carried forward*.
4. `~/Sites/workflow-bench/workflow.md` — the recommendation should be framed in terms of the workflow tested this run.

**Drift check (mandatory)**: for every platform with a `scoring.md`, confirm it has a column in `COMPARISON.md`. If it doesn't, backfill its column before rewriting the executive summary. Never run the compare step against `platforms.json` alone.

## Your job

1. Read all rubrics and each platform's `BENCH_LOG.json` (for timing and mode).
2. **Calculate weighted scores** per the current rubric at the top of `COMPARISON.md` (DX 30% · Reliability 25% · Operational 15% · Hosting 15% · Ecosystem 10% · Cost 5%). Each platform gets a final score out of 100.
3. Update `~/Sites/workflow-bench/COMPARISON.md` — the living comparison table tracked in git, which is also the only synthesis artifact. **Required document order:** (1) title + rubric notes, (2) `## Synthesized scores` table — always at the top so the scoreboard is the first thing a reader sees, (3) `## Executive summary` with Latest verdict + any prior verdicts, (4) `## Run log`, (5) `## Known gotchas`, (6) `## Dropped from roster`, (7) `## Incomplete runs`. For each newly benchmarked platform:
   - Default: add or update the platform's column in the `Synthesized scores` table (fill Language, timing rows, every 1–5 axis, and weighted total). Do not remove or overwrite existing platform columns. A weakness on one axis is not a reason to erase good scores on the others — carry it in-row.
   - **Hard constraint flag** (`⚠` in the Language row): if the platform violates a non-negotiable team constraint (e.g. Python-only for a TS team, YAML-only when the team wants code, cloud-required when we need self-host), keep the column and add `⚠` to the Language cell and the Weighted total cell. This makes the constraint visible without discarding the merit score.
   - **Dropped from roster** is reserved for platforms that are **not in the category at all** — visual-first automation tools, LLM-app builders, state-machine libraries, boot-failed platforms with no recoverable run. Those go to `## Dropped from roster` with a one-line rationale and do NOT appear in the top table. Wrong-language-but-right-category stays in the table with `⚠`.
   - Append a new entry to the `Run log` section (chronological, append-only).
   - Append any new gotchas to the `Known gotchas` table.
   - Phrasing guard: don't conflate merit score and roster decision. Write them separately: "scored X/100 — flagged with `⚠` for <constraint>" or "not in the category — moved to Dropped from roster."
4. **Rewrite the `Executive summary` → `Latest verdict` section** (replace in place — this section is not append-only). It is the opinionated, human-readable companion to the table. Include:
   - **Winner paragraph** (for 40+ dev team) — name the winner and why. Focus on: *Can the team be productive? Will this scale? Is it a joy or a drag?*
   - **Trade-offs for runners-up** — one bullet per runner-up explaining what you gain/lose.
   - **Surprises** — anything a platform did noticeably better or worse than expected. Omit the line if there are none; don't manufacture drama.
   - **Agent-tooling signal** — did richer agent tooling (MCP/skills) produce measurably better code? One paragraph.
   - Workflow-specific framing where it matters — note what THIS workflow exposed (e.g., "ArXiv-to-Slack is simple enough that DX differences are the real signal").

There is no separate `summary.md` — the executive summary lives in `COMPARISON.md` so there is one source of truth.

5. **Regenerate `index.html`** — the visual, GitHub-Pages-ready companion to `COMPARISON.md`. Same data (synthesized scores table, weighted totals, verdict, process-count / delivery model, per-platform snapshots), styled as a dark editorial page. Whenever you touch `COMPARISON.md` in step 3–4, update `index.html` in the same turn so the two never drift. Keep the existing visual design (Instrument Serif + Inter + JetBrains Mono, warm near-black palette, heatmap cells 1–5). If you add a new platform or drop one, update: the ranked list, the scoring matrix columns, the delivery-model lists, and the per-platform cards. Do not introduce external JS dependencies — keep it a single self-contained HTML file.

## Anti-bias guardrails

- Do not name a winner before writing the table. Fill the table first, rank after.
- If two platforms are within 1 point on every axis, call it a tie, not a ranked order.
- Flag any rubric field that was "not measured" — those are holes in the data, not neutral scores.
- If the surprise section is empty, write "no surprises" — don't manufacture drama.

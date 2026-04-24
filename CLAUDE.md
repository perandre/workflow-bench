# Workflow Bench — project instructions

This directory is a **benchmark harness** for comparing code-first durable-workflow platforms: Vercel Workflow, Inngest, Hatchet, Restate, Windmill, Trigger.dev.

**Goal**: Find the best workflow platform for a 40+ developer team that prioritizes DX, reliability, and operational simplicity.

## Start here

Canonical entry is the `/bench` slash command (`.claude/commands/bench.md`); `/bench-next` resumes after `/clear`. If the user types natural language ("start the bench", "run it", "go") or proposes a workflow, treat it as `/bench` and follow the same flow.

When they have a workflow in mind, you should:

1. **Suggest improvements** to make it more revealing of platform differences (e.g., add error paths, parallel steps, checkpoints—whatever exposes real-world friction).
2. **Know what good looks like**: Identify upfront what metrics matter for THIS workflow (e.g., error recovery speed, parallel efficiency, observability).
3. **Skip interview**: No team profiling needed (40+ devs, always the same constraints).
4. Then read `ORCHESTRATE.md` and execute—choose platforms and mode directly.

## Workflow enhancement protocol

When a user proposes a workflow, before benchmarking:

1. **Suggest enhancements** that make it more revealing (error paths, parallelism, checkpoints, real-world friction).
2. **Define "good results"** upfront: What metrics/behaviors should we measure? (e.g., error recovery latency, parallel efficiency, observability). This guides the scoring rubric.
3. **Keep it real**: Don't over-engineer. A 40+ dev team needs practical, not academic, tests.

Example: User says "fetch arXiv paper, post to Slack."
- **Enhancement**: Add a failure path: "if Slack post fails after 3 retries, post to a fallback email." → Tests error handling and retry strategy.
- **Good results**: Sub-second execution, clear error logs, idempotency (same paper shouldn't post twice in one day).

## Repo structure

**Tracked in git (UPPERCASE or named files):**
- `ORCHESTRATE.md` — the plan you follow when running the bench (includes the interview phase)
- `BUILD_PROMPT.md` — executed inline for each platform's build phase
- `SCORE_PROMPT.md` — executed inline for each platform's score phase
- `COMPARE_PROMPT.md` — the final aggregation you do in-session after all platforms complete
- `COMPARISON.md` — living scoring table AND the opinionated executive summary. `Latest verdict` is rewritten each run; `Run log` and `Known gotchas` are append-only. Single source of truth — there is no separate `summary.md`.
- `workflows/` — library of reusable workflow specs; user picks one at interview time
- `workflow.md` — the active spec for the current run (copied from `workflows/` or written fresh during the interview)
- `platforms.json` — ordered list of platforms to benchmark
- `services/<platform>/.gitkeep` — marks a platform as part of the roster

**Gitignored (generated, local-only):**
- `shared-secrets.env` — API keys. Do not commit; do not echo contents to chat.
- `services/<platform>/*` — all build output, code, logs, and scoring for each platform

## Ground rules

- Platforms run sequentially, never in parallel (port conflicts + accurate wall-clock measurement).
- Each platform runs directly in the main session (no sub-agents) so the user sees all output live. Between platforms the user does `/clear` to get a fresh context.
- The user is watching. Report progress concisely between platforms — do not dump full rubrics to chat.
- Do not modify a platform's code to "improve" it between build and score phases. One shot per platform.
- **`index.html` mirrors `COMPARISON.md`.** It is the visual, GitHub-Pages-ready view of the same data (scoring table, verdict, delivery model, per-platform snapshots). Whenever you edit `COMPARISON.md` — bench run, rescore, rubric refinement, roster change — update `index.html` in the same turn. Never commit drift between the two.
- **Always commit and push after code changes.** After any edit to tracked files (index.html, COMPARISON.md, prompts, workflows, etc.), commit with a clear message and push to `origin/main` without waiting to be asked. Exception: if a pre-staged change unrelated to your work is present, only commit the files you touched and leave the rest unstaged.
- **COMPARISON.md is cumulative, with a curated active roster.** It is the living summary of what we've learnt, but the top table only shows **active contenders** — platforms still in the running for a 40+ dev team. Specifically:
  - The top scoring table shows synthesized best-guess scores for active platforms only. Platforms we've ruled out are moved to the `Dropped from roster` section (one-line rationale, no further updates). Do not re-add a dropped platform without explicit user direction.
  - The "Run log" section appends a new entry per run. Entries for dropped platforms may be removed when dropping them — a one-line summary in `Dropped from roster` is what we keep.
  - The "Known gotchas" table is active-roster only. Drop a platform's row when dropping the platform.
  - The workflow-tested line is a history of workflows covered for active platforms.

## If ORCHESTRATE.md is missing

Something is wrong. Tell the user and stop — do not try to reconstruct the plan from memory.

## Continuous improvement protocol

After each benchmark run completes:
1. **Document learnings**: Update `## Learnings from benchmarks` with platform, date, gotchas found, DX observations, and patterns discovered.
2. **Improve prompts**: If a BUILD_PROMPT or SCORE_PROMPT issue caused confusion or extra debugging, refine the prompt text to prevent recurrence.
3. **Update gotchas table**: If COMPARISON.md's "Known gotchas" section is out of date or missing a pattern, add it.
4. **Refactor BUILD_PROMPT**: If a pattern (e.g., XML parsing, port config) is reusable, extract it into a helper or example in the prompt itself.
5. **Commit incrementally**: Each framework improvement is a separate commit with a clear message (e.g., "Improve BUILD_PROMPT port config guidance").

This ensures the framework gets smarter with each run, reducing friction and eliminating repeated gotchas.

## Learnings from benchmarks

### Framework bug — drift between `platforms.json` and scoring files (2026-04-23)
- **Symptom**: vercel-workflow was benched (scoring.md exists, 89/100 — highest on the roster) but never appeared in COMPARISON.md for an entire run cycle. `services/dbos/` and `services/pgflow/` also had `mode.txt` but no scoring, silently ignored.
- **Root cause**: both `/bench-next` and `COMPARE_PROMPT.md` aggregated based on `platforms.json` (the active-run queue), not on `services/*/scoring.md` on disk. Any ad-hoc or out-of-band run vanished.
- **Fix applied**: COMPARE_PROMPT.md and `/bench-next` now treat scoring files on disk as the source of truth and run drift checks for (a) orphan scorings not in COMPARISON.md and (b) `mode.txt` without `scoring.md`. ORCHESTRATE.md requires `.gitkeep` + `git add` at setup.
- **Takeaway**: never trust a single "list of things to do" file as the summary of what *has been done*. Always cross-check against artifacts on disk.

### Inngest (2026-04-23)
- **Port config**: npm script `dev:inngest` must match app server port (was hardcoded to 3003, updated to 4200). Update any new scripts to use env var or ask user upfront.
- **Idempotency in dev**: Inngest's in-memory DB doesn't persist idempotency state across restarts. CEL expressions work within a session, but second trigger behavior is unclear (initiated new run but appeared to hang). Document this gotcha.
- **arXiv API parsing**: XML response has `<entry>` wrapper for results. Regex must target entry-level tags, not feed-level. Store XML parsing patterns for reuse.
- **Execution timing**: ~1 second end-to-end for 2-step workflows (fetch + post). Very fast locally.
- **DX strengths**: TypeScript-first, hot reload, clean step API, no DSL. Minimal friction for fast iteration.
- **Framework improvement**: Port config must be synchronized across all npm scripts. Add check in ORCHESTRATE.md pre-flight.

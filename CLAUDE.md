# Workflow Bench — project instructions

This directory is a **benchmark harness** for comparing code-first durable-workflow platforms: Inngest, Mastra, Hatchet, Restate.

## Start here

If the user says anything like "start the bench", "run it", "go", "start with Inngest", or otherwise signals they want the benchmark to begin: **read `ORCHESTRATE.md` first, then execute it**. Do not improvise.

`ORCHESTRATE.md` begins with an interview phase — use `AskUserQuestion` to ask the user which platforms, which workflow, and which mode before doing anything else.

## Repo structure

**Tracked in git (UPPERCASE or named files):**
- `ORCHESTRATE.md` — the plan you follow when running the bench (includes the interview phase)
- `BUILD_PROMPT.md` — executed inline for each platform's build phase
- `SCORE_PROMPT.md` — executed inline for each platform's score phase
- `COMPARE_PROMPT.md` — the final aggregation you do in-session after all platforms complete
- `COMPARISON.md` — the living 7-dimension scoring table; updated after each bench run
- `workflows/` — library of reusable workflow specs; user picks one at interview time
- `workflow.md` — the active spec for the current run (copied from `workflows/` or written fresh during the interview)
- `platforms.json` — ordered list of platforms to benchmark
- `services/<platform>/.gitkeep` — marks a platform as part of the roster

**Gitignored (generated, local-only):**
- `shared-secrets.env` — API keys. Do not commit; do not echo contents to chat.
- `services/<platform>/*` — all build output, code, logs, and scoring for each platform
- `summary.md` — full narrative synthesis generated at the end of a complete bench run

## Ground rules

- Platforms run sequentially, never in parallel (port conflicts + accurate wall-clock measurement).
- Each platform runs directly in the main session (no sub-agents) so the user sees all output live. Between platforms the user does `/clear` to get a fresh context.
- The user is watching. Report progress concisely between platforms — do not dump full rubrics to chat.
- Do not modify a platform's code to "improve" it between build and score phases. One shot per platform.

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

### Inngest (2026-04-23)
- **Port config**: npm script `dev:inngest` must match app server port (was hardcoded to 3003, updated to 4200). Update any new scripts to use env var or ask user upfront.
- **Idempotency in dev**: Inngest's in-memory DB doesn't persist idempotency state across restarts. CEL expressions work within a session, but second trigger behavior is unclear (initiated new run but appeared to hang). Document this gotcha.
- **arXiv API parsing**: XML response has `<entry>` wrapper for results. Regex must target entry-level tags, not feed-level. Store XML parsing patterns for reuse.
- **Execution timing**: ~1 second end-to-end for 2-step workflows (fetch + post). Very fast locally.
- **DX strengths**: TypeScript-first, hot reload, clean step API, no DSL. Minimal friction for fast iteration.
- **Framework improvement**: Port config must be synchronized across all npm scripts. Add check in ORCHESTRATE.md pre-flight.

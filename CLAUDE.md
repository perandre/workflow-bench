# Workflow Bench — project instructions

This directory is a **benchmark harness** for comparing code-first durable-workflow platforms: Inngest, Mastra, Hatchet, Restate.

## Start here

If the user says anything like "start the bench", "run it", "go", "start with Inngest", or otherwise signals they want the benchmark to begin: **read `ORCHESTRATE.md` first, then execute it**. Do not improvise.

`ORCHESTRATE.md` begins with an interview phase — ask the user which platforms and which workflow before doing anything else.

## Repo structure

**Tracked in git (UPPERCASE or named files):**
- `ORCHESTRATE.md` — the plan you follow when running the bench (includes the interview phase)
- `BUILD_PROMPT.md` — executed inline for each platform's build phase
- `SCORE_PROMPT.md` — executed inline for each platform's score phase
- `COMPARE_PROMPT.md` — the final aggregation you do in-session after all platforms complete
- `COMPARISON.md` — the living 7-dimension scoring table; updated after each bench run
- `workflow.md` — the workflow spec for this run (written during the interview; read by build + score)
- `workflow-default.md` — the default "Daily HN AI digest" spec (copied to `workflow.md` if user picks the default)
- `RUNBOOK.md` — original manual runbook (reference only)
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

# Workflow Bench — project instructions

This directory is a **benchmark harness** for comparing four code-first durable-workflow platforms: Inngest, Mastra, Hatchet, Restate. Nothing else lives here.

## Start here

If the user says anything like "start the bench", "run it", "go", "start with Inngest", or otherwise signals they want the benchmark to begin: **read `ORCHESTRATE.md` first, then execute it**. Do not improvise.

Confirm once in chat ("Starting 4-platform bench per ORCHESTRATE.md. Inngest first, then Mastra, Hatchet, Restate. ~2-3h.") and begin.

## Key files in this directory

- `ORCHESTRATE.md` — the plan you follow when running the bench
- `BUILD_PROMPT.md` — executed inline for each platform's build phase
- `SCORE_PROMPT.md` — executed inline for each platform's score phase
- `COMPARE_PROMPT.md` — the final aggregation you do in-session after all four complete
- `RUNBOOK.md` — original manual runbook (reference only)
- `shared-secrets.env` — `GOOGLE_API_KEY`, `SLACK_BOT_TOKEN`, `SLACK_PREVIEW_CHANNEL`, `SLACK_DIGEST_CHANNEL`. Do not commit; do not echo contents to chat.
- `results/<platform>/` — where each platform's build + scoring lands

## Ground rules

- Platforms run sequentially, never in parallel (port conflicts + accurate wall-clock measurement).
- Each platform runs directly in the main session (no sub-agents) so the user sees all output live. Between platforms the user does `/clear` to get a fresh context.
- The user is watching. Report progress concisely between platforms — do not dump full rubrics to chat.
- Do not modify a platform's code to "improve" it between build and score phases. One shot per platform.

## If ORCHESTRATE.md is missing

Something is wrong. Tell the user and stop — do not try to reconstruct the plan from memory.

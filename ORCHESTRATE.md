# Orchestration Plan

You are running a durable-workflow benchmark **directly in this session** — no sub-agents. The user watches everything in real time. Run one platform at a time. Between platforms the user will `/clear` to get a fresh context, then paste the next platform's trigger phrase.

---

## Interview phase — ALWAYS run this first

When the user says any trigger phrase ("start the bench", "run it", "go", "start with [platform]"), run this interview before touching any platform. Do NOT skip it. Ask questions one at a time and wait for the answer.

### Q1 — Which platforms?

Ask:
> "Which platforms do you want to benchmark? Options: **inngest**, **mastra**, **hatchet**, **restate**, **windmill**. You can pick any subset — just list them. (Press Enter to use all.)"

After the user answers, overwrite `~/Sites/workflow-bench/platforms.json` with a JSON array of the selected slugs in the order they want to run them.

### Q2 — Which workflow?

Ask:
> "Which workflow do you want to test?
>
> **1 — Default:** Daily HN AI digest — fetches the top HN stories, summarises each with Gemini AI, posts a ranked digest to Slack. Tests parallel durable steps, LLM integration, and idempotency.
>
> **2 — Custom:** You describe the use case. We already have a Slack integration set up (ask Per André for the bot token if you need it). Describe what the workflow should do, what triggers it, what the steps are, and what a successful run looks like."

**If the user picks the default (1):** Copy `~/Sites/workflow-bench/workflow-default.md` to `~/Sites/workflow-bench/workflow.md`.

**If the user picks custom (2):** Save their description to `~/Sites/workflow-bench/workflow.md` using this structure:

```markdown
## The workflow: "[name the user gave it, or infer one]"

[User's description of what the workflow does, what triggers it, and what each step does]

Available env vars: [list what the user mentions, plus SLACK_BOT_TOKEN / SLACK_PREVIEW_CHANNEL if they want Slack]

No mocks, no stubs — real APIs only.

## Success criteria

[What the user says a successful run looks like — specific things to verify]
```

If the user's description is thin on success criteria, prompt once: "What should we check at the end to confirm it worked?" Then save the answer.

### Q3 — Mode?

Ask:
> "Which mode?
>
> **Installation included** — start the clock from zero: pull Docker images, install packages, configure the service, build the flow, run it. Use this the first time you test a platform.
>
> **Flow only** — the platform software is already installed and configured on this machine. Start the clock at 'build the flow'. Use this to retest a platform you've already set up."

Record the answer in `services/<P>/mode.txt` as either `installation-included` or `flow-only` for each platform. This affects what the timer covers and what gets recorded in `COMPARISON.md`.

**Timer rules:**
- **Installation included**: `date +%s > .bench-start-ts` before any install/pull step. Record three split times in `BENCH_LOG.json`: `installMinutes` (install done → ready to write code), `buildMinutes` (first line of code → first green run), `executionMinutes` (trigger → confirmed output).
- **Flow only**: `date +%s > .bench-start-ts` before writing the first line of flow code. Record `buildMinutes` and `executionMinutes` only. Set `installMinutes` to `null`.

### Skip the interview if workflow.md is fresh

If `~/Sites/workflow-bench/workflow.md` was modified within the last 60 seconds (check with `stat -f %m ~/Sites/workflow-bench/workflow.md` on macOS), skip the interview entirely — the web UI already wrote the files. Read `workflow.md` and `platforms.json` to confirm what was set, then begin immediately.

### Confirm and begin

After the interview (or after detecting a fresh workflow.md), confirm once in chat:

> "Ready. Benchmarking: [list]. Workflow: [name]. Starting [first platform] now."

Then begin the first platform immediately — no further questions.

---

## Before starting any platform

Read `~/Sites/workflow-bench/COMPARISON.md` — specifically the **Known gotchas** section. Prior bench runs have documented platform-specific traps that are not in official docs. Apply this knowledge before writing a single line of code for that platform.

## Ground truth files (read before acting)

- `~/Sites/workflow-bench/BUILD_PROMPT.md` — what to build
- `~/Sites/workflow-bench/SCORE_PROMPT.md` — how to score
- `~/Sites/workflow-bench/COMPARE_PROMPT.md` — final aggregation (done in-session after all four)
- `~/Sites/workflow-bench/shared-secrets.env` — `GOOGLE_API_KEY`, `SLACK_BOT_TOKEN`, `SLACK_PREVIEW_CHANNEL`, `SLACK_DIGEST_CHANNEL`
- `~/Sites/workflow-bench/RUNBOOK.md` — original manual runbook (context only)

## Skills per platform

Always invoke these before writing code for the respective platform:

| Platform | Skills to use |
|---|---|
| inngest | `inngest-skills:inngest-setup`, `inngest-skills:inngest-durable-functions`, `inngest-skills:inngest-steps`, `inngest-skills:inngest-flow-control` |
| mastra | No dedicated skill installed — use official docs at https://mastra.ai/docs and the `mastra` npm package. GitHub: https://github.com/mastra-ai/mastra |
| hatchet | Read `~/Sites/workflow-bench/skills/hatchet-cli/SKILL.md` and relevant files under `skills/hatchet-cli/references/` before using the CLI |
| restate | No dedicated skill installed — use official docs and the `@restatedev/restate-sdk` npm package docs |

## Platform order

Read `~/Sites/workflow-bench/platforms.json` — it lists which platforms to run and in what order. Run them in that order. To add a platform: add its slug to the array and create `services/<slug>/` with a `.gitkeep`. To remove one: delete it from the array.

Default order (as shipped):
1. **inngest** — baseline
2. **mastra** — agent-first framework, compare workflow model with Inngest
3. **hatchet** — different shape (workers + Postgres), mature
4. **restate** — most architecturally different, do last

---

## Per-platform instructions

When the user says "start [platform]" or "run [platform]" or "go" (when context is clear), execute these steps directly — no sub-agents.

### 1. Prep

```bash
cd ~/Sites/workflow-bench/services/<P>/
cp ~/Sites/workflow-bench/shared-secrets.env .env
date +%s > .bench-start-ts
```

### 2. BUILD — execute BUILD_PROMPT.md inline

Read `BUILD_PROMPT.md` in full. Then carry out every instruction in it directly:
- Working directory: `~/Sites/workflow-bench/services/<P>/`
- Replace `[TOOL]` with the platform's canonical name ("Inngest", "Mastra", "Hatchet", "Restate")
- Install packages, write code, boot-check that it at least compiles
- Write `BENCH_LOG.json` exactly as specified — mandatory
- **Use the relevant skills** listed below for the current platform before writing any code

### 3. Timestamp

```bash
date +%s > ~/Sites/workflow-bench/services/<P>/.bench-end-ts
```

### 4. SCORE — execute SCORE_PROMPT.md inline

Read `SCORE_PROMPT.md` in full. Then carry out every step directly:
- Do not modify the build's code
- Boot the project, trigger the cron, run failure and idempotency tests
- Write `scoring.md` filling every rubric field

### 5. Tear down

```bash
docker compose down -v  # or platform-appropriate equivalent
```

Confirm no stray processes on ports 3000, 3001, 7070, 8080, 8233, 8288.

### 6. Report to the user

Emit a concise chat update:
- Platform name
- Build wall-clock (end_ts − start_ts seconds)
- Boot success y/n, failure-test outcome, idempotency outcome
- One-line standout observation

Then tell the user:

> **Done with [platform].** Type `/clear` to reset context, then say "run [next platform]" to continue.

Do not dump the full `scoring.md` to chat — the user can read it themselves.

---

## After all four platforms

After the final platform is scored, read all four `scoring.md` files and synthesize `~/Sites/workflow-bench/summary.md` per `COMPARE_PROMPT.md`. Do this in-session (the last platform's session, before `/clear`).

Give the user a final chat summary:
- Ranked recommendation
- One paragraph per platform
- Surprises
- Path to `summary.md` for full detail

---

## Failure handling

- **Build must reach a working run.** Fixing obvious issues (missing middleware, port conflicts, wrong env var) is part of the build, not "improvement". Keep debugging until the workflow executes end-to-end. Only give up if the platform has a fundamental blocker you genuinely cannot resolve (e.g. requires a cloud account despite LOCAL-ONLY efforts). In that case document every attempted fix in `BENCH_LOG.json` with `"buildStatus": "failed"` and a specific `"failureReason"`.
- **Scoring gets one rescue.** If the project fails to boot during scoring, apply one obvious fix, log it, and continue. If still broken after one fix, score from static analysis and mark runtime fields `not verified`.
- Never retry a platform to "improve" its result after scoring is complete. One shot per platform.

---

## Start phrase recognition

Trigger phrases:
- "start the bench" → begin with Inngest
- "run it" → begin with Inngest (or next platform if context makes that clear)
- "start with [platform]" / "run [platform]" → begin that platform
- "go" → begin with Inngest

Confirm once in chat, then begin immediately:

> Starting [platform] build. Working in `services/<P>/`. You'll see everything as it happens.

# Orchestration Plan

You are running a four-platform durable-workflow benchmark **directly in this session** — no sub-agents. The user watches everything in real time. Run one platform at a time. Between platforms the user will `/clear` to get a fresh context, then paste the next platform's trigger phrase.

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

Read `~/Sites/workflow-bench/platforms.json` — it lists which platforms to run and in what order. Run them in that order. To add a platform: add its slug to the array and create `results/<slug>/` with a `.gitkeep`. To remove one: delete it from the array.

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
cd ~/Sites/workflow-bench/results/<P>/
cp ~/Sites/workflow-bench/shared-secrets.env .env
date +%s > .bench-start-ts
```

### 2. BUILD — execute BUILD_PROMPT.md inline

Read `BUILD_PROMPT.md` in full. Then carry out every instruction in it directly:
- Working directory: `~/Sites/workflow-bench/results/<P>/`
- Replace `[TOOL]` with the platform's canonical name ("Inngest", "Mastra", "Hatchet", "Restate")
- Install packages, write code, boot-check that it at least compiles
- Write `BENCH_LOG.json` exactly as specified — mandatory
- **Use the relevant skills** listed below for the current platform before writing any code

### 3. Timestamp

```bash
date +%s > ~/Sites/workflow-bench/results/<P>/.bench-end-ts
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

After the final platform is scored, read all four `scoring.md` files and synthesize `~/Sites/workflow-bench/comparison.md` per `COMPARE_PROMPT.md`. Do this in-session (the last platform's session, before `/clear`).

Give the user a final chat summary:
- Ranked recommendation
- One paragraph per platform
- Surprises
- Path to `comparison.md` for full detail

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

> Starting [platform] build. Working in `results/<P>/`. You'll see everything as it happens.

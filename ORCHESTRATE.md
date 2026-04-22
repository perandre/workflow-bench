# Orchestration Plan

Run one platform at a time directly in this session — no sub-agents. Between platforms the user does `/clear` then triggers the next.

---

## Interview phase — ALWAYS run this first

**Use `AskUserQuestion` for every question** — never plain text.

### Step 1 — Platforms + mode (one call, two questions)

```
Q1 multiSelect: "Which platforms?" — inngest, hatchet, restate, windmill (+ Other for mastra)
Q2 single:      "Which mode?"      — "Flow only" / "Installation included"
```

Write `platforms.json` with selected slugs. Write `services/<P>/mode.txt` for each platform.

**Timer rules:**
- **Flow only**: start timer (`date +%s > .bench-start-ts`) before first line of flow code. Log `buildMinutes`, `executionMinutes`. Set `installMinutes: null`.
- **Installation included**: start timer before any install/pull. Log all three: `installMinutes`, `buildMinutes`, `executionMinutes`.

### Step 2 — Workflow (one call)

`ls ~/Sites/workflow-bench/workflows/` then `AskUserQuestion` with one option per file + "New workflow".

- **Existing**: `cp workflows/<chosen>.md workflow.md`
- **New**: ask in plain text, save to `workflow.md` and also commit to `workflows/` for the library.

### Step 3 — Confirm and go

One line in chat: "Ready. Benchmarking: [list]. Workflow: [name]. Starting [first platform] now." Then begin immediately.

---

## Before starting any platform

1. **Check for existing build**: run `ls ~/Sites/workflow-bench/services/<P>/` — if there are files beyond `.gitkeep` and `mode.txt`, use `AskUserQuestion`:
   > "Existing build found in services/<P>/. What do you want to do?"
   - "Score existing build" → skip to step SCORE
   - "Rebuild for this workflow" → wipe `src/` and rebuild

2. **Read gotchas**: scan the **Known gotchas** table in `COMPARISON.md` for this platform. Apply before writing code.

3. **Pick a high port** (≥4000) for any worker/app process to avoid conflicts with common local services. Document it once; don't probe.

4. **Read skills** if available (see table below). If a skill isn't in the available-skills panel, skip and build directly.

---

## Per-platform skills

| Platform | Skills |
|---|---|
| inngest | `inngest-skills:*` (if listed in available-skills panel) |
| hatchet | Read `~/Sites/workflow-bench/skills/hatchet-cli/SKILL.md` + relevant `references/` files |
| mastra | No skill — use https://mastra.ai/docs |
| restate | No skill — use `@restatedev/restate-sdk` docs |

---

## Per-platform execution

### 1. Prep
```bash
cd ~/Sites/workflow-bench/services/<P>/
cp ~/Sites/workflow-bench/shared-secrets.env .env
date +%s > .bench-start-ts
```

### 2. BUILD — execute BUILD_PROMPT.md inline
Read it, follow it. Write `BENCH_LOG.json` when a successful run completes.

### 3. Timestamp
```bash
date +%s > ~/Sites/workflow-bench/services/<P>/.bench-end-ts
```

### 4. SCORE — execute SCORE_PROMPT.md inline
Read it, follow it. Write `scoring.md`.

### 5. Tear down
Kill all platform processes. Confirm ports are clear.

### 6. Report
One paragraph in chat: platform, build time, boot y/n, run outcome, one standout observation. Tell user to `/clear` and run next platform.

---

## Failure handling

- **Build**: fix obvious issues (port conflict, missing env var, wrong import) — that's part of the build. Give up only on a genuine blocker; document it in `BENCH_LOG.json` with `"buildStatus": "failed"`.
- **Score**: one rescue attempt allowed. If still broken, score from static analysis and mark runtime fields `not verified`.
- Never re-run a platform to improve its score.

---

## After all platforms

Read all `scoring.md` files, synthesize `summary.md` per `COMPARE_PROMPT.md`. Give user a ranked recommendation in chat.

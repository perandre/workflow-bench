# Orchestration Plan

Run one platform at a time directly in this session — no sub-agents. Between platforms the user does `/clear` then triggers the next.

---

## Setup phase — ALWAYS run this first

**Use `AskUserQuestion` for platforms + mode only** — no team interview needed (always 40+ devs).

### Step 1 — Platforms + mode (one call, two questions)

```
Q1 multiSelect: "Which platforms?" — vercel-workflow, inngest, hatchet, restate, windmill, trigger-dev
Q2 single:      "Which mode?"      — "Flow only" / "Installation included"
```

Write `platforms.json` with selected slugs. For each platform also write `services/<P>/mode.txt` **and** `touch services/<P>/.gitkeep` + `git add services/<P>/.gitkeep` — the `.gitkeep` is the roster-membership signal required by `CLAUDE.md`. Without it, the platform can be scored without ever entering the cumulative table.

**Timer rules:**
- **Flow only**: start timer (`date +%s > .bench-start-ts`) before first line of flow code. Log `buildMinutes`, `executionMinutes`. Set `installMinutes: null`.
- **Installation included**: start timer before any install/pull. Log all three: `installMinutes`, `buildMinutes`, `executionMinutes`.

### Step 2 — Workflow is already defined

Workflow should already exist in `workflow.md` (proposed by agent before setup phase, or user provided). If missing, ask in plain text, save to `workflow.md` and commit to `workflows/` library.

### Step 3 — Confirm and go

One line in chat: "Ready. Benchmarking: [list]. Workflow: [name]. Starting [first platform] now." Then begin immediately.

---

## Before starting any platform

1. **Check for existing build**: run `ls ~/Sites/workflow-bench/services/<P>/src/` (or equivalent) — if flow files already exist, use `AskUserQuestion`:
   > "Existing flows found in services/<P>/. What do you want to do?"
   - "Add new flow for this workflow" → create a new flow file alongside existing ones; register it in the worker
   - "Score an existing flow" → ask which flow to score, then skip to SCORE

2. **Read gotchas**: scan the **Known gotchas** table in `COMPARISON.md` for this platform. Apply before writing code.

3. **Pick a high port** (≥4000) for any worker/app process to avoid conflicts with common local services. Document it once; don't probe.

4. **Read skills** if available (see table below). If a skill isn't in the available-skills panel, skip and build directly.

---

## Per-platform skills

| Platform | Skills |
|---|---|
| vercel-workflow | `vercel:workflow` skill (if listed in available-skills panel) + bundled docs in `node_modules/workflow/docs/` |
| inngest | `inngest-skills:*` (if listed in available-skills panel) |
| hatchet | No skill — use `hatchet-docs` MCP or `@hatchet-dev/typescript-sdk` docs |
| restate | No skill — use `@restatedev/restate-sdk` docs |
| windmill | No skill — use `wmill.getVariable()` + `/api/openapi.json` on live instance |
| trigger-dev | No skill — ensure imports come from `@trigger.dev/sdk/v3` |

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

Read all `scoring.md` files and update `COMPARISON.md` per `COMPARE_PROMPT.md` (scoring table, run log, gotchas, and rewritten `Executive summary → Latest verdict`). Give user a ranked recommendation in chat.

## Drift checks (run at end of every bench and at start of `/bench-next`)

These exist because `platforms.json` is not the source of truth — scoring files are. Without these, ad-hoc runs silently disappear from `COMPARISON.md`.

```bash
# Orphan scorings: scored but missing from COMPARISON.md
# Normalises slug by stripping '-' and '.' so e.g. `trigger-dev` matches `Trigger.dev`
# and `windmill.dev` matches `Windmill`.
doc=$(tr -d ' .-' < COMPARISON.md)
for d in services/*/scoring.md; do
  p=$(basename $(dirname "$d"))
  slug=$(echo "$p" | tr -d ' .-')
  echo "$doc" | grep -qi "$slug" || \
    echo "ORPHAN: $p scored but not in COMPARISON.md — backfill its column"
done

# Incomplete runs: mode.txt without scoring.md
for d in services/*/mode.txt; do
  p=$(basename $(dirname "$d"))
  [ -f "services/$p/scoring.md" ] || echo "INCOMPLETE: $p — list under 'Incomplete runs' in COMPARISON.md"
done
```

Surface findings to the user and backfill before declaring the bench done.

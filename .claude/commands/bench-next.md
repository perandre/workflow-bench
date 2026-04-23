---
description: Resume the bench after /clear — run the next platform
---

Resume a bench run that's in progress. The user just did `/clear` and needs the next platform to start.

## 1. Figure out where we are

```bash
cat platforms.json
ls services/*/scoring.md 2>/dev/null
ls services/*/mode.txt 2>/dev/null
cat workflow.md | head -5
```

- Platforms list for the *active run* comes from `platforms.json`.
- A platform is "done" for this run if `services/<slug>/scoring.md` exists.
- The next platform is the first slug in `platforms.json` without a `scoring.md`.

## 2. Drift checks (always run — these prevent silent data loss)

Before deciding next steps, run these two checks against *all* of `services/*/`, not just the active run:

**Orphan scorings** — platforms with a `scoring.md` that are not represented in `COMPARISON.md`. Normalise by stripping `-`/`.` so `trigger-dev` matches `Trigger.dev`:
```bash
doc=$(tr -d ' .-' < COMPARISON.md)
for d in services/*/scoring.md; do
  p=$(basename $(dirname "$d"))
  echo "$doc" | grep -qi "$(echo "$p" | tr -d ' .-')" || \
    echo "ORPHAN: $p has scoring.md but is not in COMPARISON.md"
done
```

**Incomplete runs** — dirs with `mode.txt` but no `scoring.md`:
```bash
for d in services/*/mode.txt; do
  p=$(basename $(dirname "$d"))
  [ -f "services/$p/scoring.md" ] || echo "INCOMPLETE: $p has mode.txt but no scoring.md"
done
```

If either check surfaces findings, surface them to the user before continuing. Orphans must be backfilled into `COMPARISON.md` (run the compare step for those platforms). Incompletes should be noted in the `Incomplete runs` section of `COMPARISON.md` — do not silently ignore them.

## 3. If all platforms in `platforms.json` are done

Run the final comparison: read `COMPARE_PROMPT.md`, aggregate **every `services/*/scoring.md` on disk** (not just the ones in `platforms.json`), update `COMPARISON.md` per the cumulative rules in `CLAUDE.md` (scoring table + run log + gotchas + rewritten `Executive summary → Latest verdict`), and give the user a one-paragraph ranked recommendation in chat. Done.

## 4. Otherwise — start the next platform

Read `ORCHESTRATE.md` "Before starting any platform" + "Per-platform execution" sections and execute them for the next platform. Re-read gotchas from `COMPARISON.md` for this platform before writing code.

One-line confirmation in chat: "Resuming with [platform]. [N] of [total] done." Then begin.

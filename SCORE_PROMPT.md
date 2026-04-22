# Score Prompt — paste verbatim into a fresh Claude Code session AFTER the build completes

You are scoring a workflow-automation benchmark run. The build is already done — do not modify or "improve" the build's code. Your job is only to measure it.

Working directory: `~/Sites/workflow-bench/results/[TOOL]/`

## Step 1 — gather objective data

Read these files and extract facts:
- `BENCH_LOG.json` (the builder's own log)
- `README.md`
- The workflow file(s) referenced in `BENCH_LOG.files`
- `package.json` (for dep list + versions)

If `BENCH_LOG.json` is missing, note that as a process-compliance failure but continue scoring from what exists.

## Step 2 — boot the project

Follow the README exactly as written. Capture:
- Did `npm install` (or equivalent) succeed without editing anything? (y/n)
- Did the dev server / worker / dashboard boot first try? (y/n, with error if not)
- How many local processes does it require? (count with `ps` or by reading the README)

If it fails to boot, try **one** reasonable fix (obvious typo, missing env var you can name from `shared-secrets.env`, etc). Log the fix. Do not iterate past one fix. "Needed rescue" is a data point.

## Step 3 — trigger the workflow immediately (do NOT wait for cron)

First, read `~/Sites/workflow-bench/workflow.md` — it defines what this workflow does and what a successful run looks like. Use the "Success criteria" section to drive your verification below.

Use the `manualTriggerCommand` from `BENCH_LOG.json` to fire the workflow **right now**. Do not wait for the scheduled cron time. Run the command, then actively watch for completion.

```bash
# Run the manualTriggerCommand from BENCH_LOG.json exactly as written
```

Wait for the run to finish — watch the logs or dashboard until it reaches a terminal state (completed or errored). Then verify each item listed under "Success criteria" in `workflow.md`. Also verify:
- Run kicked off (dashboard shows it / logs emit a run ID): y/n
- Run completed without unhandled errors: y/n

If the `manualTriggerCommand` in `BENCH_LOG.json` is missing or wrong, find the correct trigger method from the README or platform docs and use that. Log what you used.

## Step 4 — failure injection (if step 3 passed)

Pick one:
- Set `SLACK_BOT_TOKEN` to an invalid value (e.g. `xoxb-invalid`), re-trigger. Does the step retry and show in the dashboard as such? After restoring the URL, does it complete?
- Kill the worker/container mid-run. Does the run resume when the worker returns?

Log which test you ran and the outcome.

## Step 5 — idempotency test

Trigger the workflow a second time (same logical unit — e.g. same UTC date). Confirm:
- No duplicate side effects (per the "Success criteria" in `workflow.md`)
- Dashboard either shows a skipped run or a deduped run

## Step 6 — write the rubric

Save to `~/Sites/workflow-bench/results/[TOOL]/scoring.md` using this exact structure. Fill every field. Use `?` only when you genuinely can't measure.

```markdown
# Platform: [TOOL]

## Pre-run
- Agent tooling used (MCP/skills/rules/docs): [from BENCH_LOG]
- Version of platform SDK: [from package.json]
- Did Claude Code fetch docs first? (y/n): [from BENCH_LOG]

## Time
- Total wall-clock from prompt submit to first green run (minutes): [from a wall-clock file the user provides, or write "not measured"]
- Number of Claude Code turns: [from user log, or "not measured"]
- Number of times user intervened/corrected: [from user log]

## Code quality (0-5)
- HITL primitive idiomatic (N/A for this prompt — no HITL): N/A
- Parallel primitive idiomatic: [0-5 + one-sentence justification]
- Idempotency correct: [0-5]
- Overall code cleanliness: [0-5]

## Developer experience (0-5)

**This section is mandatory and must be scored with the same rigour as runtime. "It works" is not enough — score what it's like to build and iterate on it.**

- Local dev loop (0-5): [How fast is the edit→run cycle? Can you develop without Docker/cloud? Is there file-watch/hot-reload? Penalise hard for "must boot full stack to see any change".]
- Flow authoring (0-5): [Is the workflow defined in real typed code in your editor, or in a JSON/YAML DSL / browser UI? Do you get IDE support, type safety, and local unit tests across step boundaries?]
- Secrets / config (0-5): [How much boilerplate to wire in a secret? Is the mechanism obvious from docs or did it require discovery?]
- Discoverability (0-5): [Could you find correct API/SDK usage from docs alone, or did you need to dig into source/openapi/package internals?]
- Git / source-of-truth (0-5): [Is the workflow definition version-controllable as readable code? Is the database/platform the source of truth instead of your repo?]
- Debuggability once running (0-5): [Per-step visibility, log access, replay — score this separately from the build-time DX above.]

**Fit assessment (required):** Write 2–4 sentences that explicitly separate:
1. *Structural fit* — do the platform's primitives match this workflow's shape?
2. *Developer fit* — is the day-to-day build loop good for a code-first developer?

These often diverge. State both.

## Runtime
- Booted first try: [y/n]
- Trigger fired manually as expected: [y/n]
- Parallel steps visible as individual steps in dashboard: [y/n]
- Success criteria from workflow.md all met: [y/n, or list which ones failed]
- Failure test passed: [y/n + which test]
- Idempotent on second trigger: [y/n]
- Dashboard quality for debugging (0-5): [with justification]

## Infra footprint
- Number of services running locally: [count]
- External deps: [list]
- External deps RAM at idle: [rough MB — `docker stats` or `ps`]
- Time to tear down and bring back up (seconds): [measure with `time docker compose down && docker compose up -d`]

## License + self-host posture
- License: [from the tool's LICENSE file / docs]
- Default-on telemetry that phones home: [y/n + what]
- Self-host possible without cloud account: [y/n]

## Notes / surprises
[free-form 3-5 bullets — the stuff the rubric misses]
```

## Step 7 — tear down

```
docker compose down -v  # or equivalent
```

Confirm nothing's left running before exiting the session.

## Boundaries

- Do not attempt to improve the build's code.
- Do not skip Step 6 fields to save time. Fill every one.
- If a field is genuinely impossible to measure (e.g. dashboard doesn't exist), write "not applicable" with one-line justification.

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

Use the `manualTriggerCommand` from `BENCH_LOG.json` to fire the workflow **right now**. Do not wait for the scheduled cron time. Run the command, then actively watch for completion.

```bash
# Run the manualTriggerCommand from BENCH_LOG.json exactly as written
```

Wait for the run to finish — watch the logs or dashboard until it reaches a terminal state (completed or errored). Then verify in order:
- Run kicked off (dashboard shows it / logs emit a run ID): y/n
- All 30 parallel fetches visible as individual steps in the dashboard: y/n
- Top 5 digest arrived in the Slack channel matching `SLACK_DIGEST_CHANNEL`: y/n — **check the actual Slack channel, don't assume**
- Run completed without errors: y/n

If the `manualTriggerCommand` in `BENCH_LOG.json` is missing or wrong, find the correct trigger method from the README or platform docs and use that. Log what you used.

## Step 4 — failure injection (if step 3 passed)

Pick one:
- Set `SLACK_BOT_TOKEN` to an invalid value (e.g. `xoxb-invalid`), re-trigger. Does the step retry and show in the dashboard as such? After restoring the URL, does it complete?
- Kill the worker/container mid-run. Does the run resume when the worker returns?

Log which test you ran and the outcome.

## Step 5 — idempotency test

Trigger the cron a second time (same UTC date). Confirm:
- No duplicate Slack post
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

## Runtime
- Booted first try: [y/n]
- Cron trigger fired manually as expected: [y/n]
- All 30 parallel fetches visible in dashboard: [y/n]
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

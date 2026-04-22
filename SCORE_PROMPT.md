# Score Prompt

Score the completed build. Do not modify the build's code.

Working directory: `~/Sites/workflow-bench/services/[TOOL]/`

## 1 — Read facts
Read `BENCH_LOG.json`, the workflow file(s) listed in it, and `package.json`. Note version, LOC, infra.

## 2 — Boot
Follow README exactly. Note: booted first try y/n. One rescue attempt allowed — log it if used.

## 3 — Trigger and verify
Use `manualTriggerCommand` from `BENCH_LOG.json`. Wait for terminal state. Check run status with the minimal platform API call (status field only — don't pull full step traces unless debugging). Verify each success criterion from `workflow.md`.

## 4 — Idempotency check (fast)
Send a second trigger with the same logical key (same UTC date). Check whether a second run appears. Two tool calls max: trigger + status check. Record y/n.

## 5 — Write scoring.md

Keep answers to one line per field. Save to `services/[TOOL]/scoring.md`:

```markdown
# Platform: [TOOL]

## Pre-run
- SDK version: [from package.json]
- Agent tooling: [skills/docs used, from BENCH_LOG]

## Timing
- Build (min): [from bench-start-ts / bench-end-ts]
- Execution (sec): [trigger to completion]

## Code quality (0-5)
- Parallel primitive: [score] — [one sentence why]
- Idempotency: [score] — [one sentence why]
- Cleanliness: [score] — [one sentence why]

## Developer experience (0-5)
- Local dev loop: [score] — [one line]
- Flow authoring: [score] — [one line: code vs DSL vs browser UI]
- Secrets/config: [score] — [one line]
- Discoverability: [score] — [one line]
- Git/source-of-truth: [score] — [one line]
- Debuggability: [score] — [one line]

**Fit:** [2 sentences: structural fit + developer fit — these often diverge, state both]

## Runtime
- Booted first try: [y/n + rescue if needed]
- Run completed: [y/n]
- Parallel steps visible in dashboard: [y/n]
- Success criteria met: [y/n or which failed]
- Idempotent: [y/n]
- Dashboard quality: [0-5] — [one line]

## Infra
- Local services: [count + names]
- External deps: [list]
- RAM at idle: [rough MB]

## License
- License: [name]
- Telemetry: [y/n]
- Self-host without cloud account: [y/n]

## Surprises
- [bullet]
- [bullet]
```

## 6 — Tear down
Kill all platform processes. Confirm ports are clear.

---

**Rules:** Don't improve the code. Fill every field — use `?` only when genuinely unmeasurable.

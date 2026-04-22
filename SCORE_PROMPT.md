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

**Weighted scoring for 40+ dev team**: DX 40%, Reliability 30%, Operational Load 20%, Cost 10%.

Save to `services/[TOOL]/scoring.md`:

```markdown
# Platform: [TOOL]

## Pre-run
- SDK version: [from package.json]
- Agent tooling: [skills/docs used, from BENCH_LOG]

## Timing
- Build (min): [from bench-start-ts / bench-end-ts]
- Execution (sec): [trigger to completion]
- First-time setup (min): [how long for a new dev to boot, run, understand logs]

## Developer Experience (0-5, 40% weight)
- Onboarding friction: [score] — [can a new dev understand in <30 min?]
- Code clarity: [score] — [TypeScript-first? DSL? Readable?]
- Local dev loop: [score] — [hot reload? Fast iteration?]
- Error debugging: [score] — [logs clear? Can you fix at 2 AM?]
- Documentation: [score] — [official docs sufficient? Examples?]

**DX Summary:** [one sentence on overall friction]

## Reliability (0-5, 30% weight)
- Idempotency: [score] — [deduplication works? Consistent?]
- Retry handling: [score] — [clear, predictable retry behavior?]
- Error recovery: [score] — [can failed steps recover gracefully?]
- Test verification: [y/n] — [did the run complete successfully?]

**Reliability Summary:** [one sentence on production confidence]

## Operational Load (0-5, 20% weight)
- Local services: [count + names]
- Infra complexity: [score] — [Docker? Database? Or just processes?]
- Observability: [score] — [dashboard quality? Log clarity?]
- Maintenance burden: [y/n] — [will this need babysitting?]

**Operational Summary:** [one sentence on team burden]

## Cost & Lock-in (0-5, 10% weight)
- License: [MIT/Apache/proprietary/other]
- Vendor lock-in: [y/n] — [can you run entirely self-hosted?]
- SaaS requirement: [y/n] — [do you HAVE to use their cloud?]

**Cost Summary:** [one sentence on financial & freedom risk]

## Weighted Score (total 0-100)
- DX: [DX score] × 0.40 = [XX]
- Reliability: [Reliability score] × 0.30 = [XX]
- Operational: [Operational score] × 0.20 = [XX]
- Cost: [Cost score] × 0.10 = [XX]
- **Total: [XX]/100**

## Trade-offs
[2-3 bullet points on what you gain vs lose vs other platforms. e.g., "Inngest trades visibility for speed; Hatchet trades DX for operational depth."]

## Surprises & Gotchas
- [bullet]
- [bullet]
```

## 6 — Tear down
Kill all platform processes. Confirm ports are clear.

---

**Rules:** Don't improve the code. Fill every field — use `?` only when genuinely unmeasurable.

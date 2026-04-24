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

**Weighted scoring for 40+ dev team**: AI Authoring Fit 30%, Reliability 25%, Operational Load 15%, Hosting & Licensing 20%, Ecosystem Maturity 10%.

Rationale: assume workflows are authored primarily by an AI/LLM, then reviewed and operated by humans. High scores therefore require a **text-first source of truth**, a small and regular API surface, errors an agent can self-correct from, and docs/examples that match the installed version. Visual-first tools and stringly-typed DSLs can still work, but they should score poorly if an AI is likely to emit brittle or non-reviewable output. Hosting/portability and licensing/lock-in remain merged into one 20% dimension covering self-host viability, framework coupling, OSS license, and SaaS-requirement. Multi-language support is explicitly *not* scored — this team stack is TypeScript or Python.

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

## AI Authoring Fit (0-5, 30% weight)
- Source of truth: [score] — [plain code in git, or visual/YAML/JSON DSL? Are diffs reviewable?]
- API regularity: [score] — [small, consistent surface? Hidden magic? String interpolation?]
- Agent iteration loop: [score] — [can an agent edit locally, run, inspect, and retry quickly?]
- Error recoverability: [score] — [are runtime/build errors specific enough for an agent to self-correct?]
- Documentation for agents: [score] — [version-locked docs, examples, skills, MCP, or other agent-friendly references?]

**AI Authoring Summary:** [one sentence on whether an LLM is likely to produce correct, maintainable flows here]

## Reliability (0-5, 25% weight)
- Idempotency: [score] — [deduplication works? Consistent?]
- Retry handling: [score] — [clear, predictable retry behavior?]
- Error recovery: [score] — [can failed steps recover gracefully?]
- Test verification: [y/n] — [did the run complete successfully?]

**Reliability Summary:** [one sentence on production confidence]

## Operational Load (0-5, 15% weight)
- Local services: [count + names]
- Infra complexity: [score] — [Docker? Database? Or just processes?]
- Observability: [score] — [dashboard quality? Log clarity?]
- Maintenance burden: [y/n] — [will this need babysitting?]

**Operational Summary:** [one sentence on team burden]

## Hosting & Licensing (0-5, 20% weight)

Combined dimension covering everything that speaks to vendor capture — who owns the infra, who owns the code, and how hard is it to leave.

- Self-host viability: [score] — [is self-host a first-class happy path, or a documented workaround?]
- Framework coupling: [score] — [can you run this without committing to a specific host framework (e.g., Next.js)?]
- Production story off-vendor: [score] — [is the dashboard / observability / retry UI available outside the vendor's cloud?]
- License: [MIT/Apache/BSL/proprietary/other] — [OSI-approved? Any reseller / usage restrictions?]
- SaaS requirement: [y/n] — [do you HAVE to use their cloud, even for dev?]

**Hosting & Licensing Summary:** [one sentence on where this realistically runs and what it costs to leave]

## Ecosystem Maturity (0-5, 10% weight)
- Adoption signals: [score] — [GitHub stars, npm downloads, notable production users]
- Community depth: [score] — [StackOverflow answers, Discord activity, third-party content]
- Track record: [score] — [age, stability, breaking-change frequency]

**Ecosystem Summary:** [one sentence on whether a 40+ dev team can hire, Google, and trust this in 3 years]

## Weighted Score (total 0-100)
- AI Authoring: [AA] × 0.30 = [XX]
- Reliability: [Rel] × 0.25 = [XX]
- Operational: [Ops] × 0.15 = [XX]
- Hosting & Licensing: [HL] × 0.20 = [XX]
- Ecosystem: [Eco] × 0.10 = [XX]
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

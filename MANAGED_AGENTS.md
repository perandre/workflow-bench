# Managed Agent Platforms — Strategy Notes

Captured 2026-04-26 during a conversation about whether to broaden the bench
beyond self-hosted durable-workflow platforms. Not a decision doc — a snapshot
of thinking that should inform future bench design.

## The question

If we drop the self-hosting requirement, how should we rate complete managed
agent platforms (Gemini Enterprise, Claude Managed Agents, OpenAI AgentKit)
against our current roster (Inngest, Hatchet, Restate, Trigger.dev, etc.)?

## Honest summary

Managed agent platforms are **a different category** of product than the
durable-workflow platforms the bench currently scores. They are not
strictly better or worse — they optimize for different axes. Treating them
as drop-in alternatives in the same scoring table produces misleading rank
orders in either direction.

The fundamental split: **who decides what happens next.**

- **Durable-workflow platforms** (Inngest, Restate, Temporal, Hatchet,
  Trigger.dev): *code* decides. You write a DAG; the runtime memoizes IO so
  replays are deterministic. Built for control-plane workflows with hard
  semantic guarantees (idempotency, exactly-once, waitForEvent, durable
  sleep).
- **Managed agent platforms** (Gemini Enterprise, Claude Managed Agents,
  OpenAI AgentKit): *model* decides. You give a goal + tools; the harness
  loops. Built for open-ended, long-running, model-driven work.

ADK/Gemini Enterprise straddles both — it has SequentialAgent / ParallelAgent
/ LoopAgent for code-decided flows alongside model-driven sub-agent graphs —
but its center of gravity is the agent side.

## What Gemini Enterprise actually offers (Next '26)

- **Agent Runtime** — sub-second cold starts, multi-day persistence, hardened
  sandbox for code/browser/bash. Cloud-only.
- **ADK** — open-source, Python/TS/Go/Java. Graph-based composition.
- **Memory Bank + Memory Profiles** — durable cross-session memory with
  custom session IDs that map to your DB.
- **Governance** — Agent Identity (cryptographic ID), Agent Registry, Agent
  Gateway, Anomaly/Threat Detection, Security Command Center.
- **Eval** — Agent Simulation (synthetic users + virtualized tools), Agent
  Evaluation (autoraters on live traffic), Agent Optimizer.
- **Interop** — MCP, A2A, AP2 (payments).
- **Models** — 200+ via Model Garden, including Claude Opus/Sonnet/Haiku.
- **Pricing** — vCPU-hour + GiB-hour on Agent Runtime.

## What Claude Managed Agents actually offers (April 2026, beta)

- Four concepts: Agent / Environment / Session / Events.
- Built-in tools: Bash, file ops, web search/fetch, MCP servers.
- Server-side event log with replay; harness restart resumes from last event.
- SSE streaming; mid-flight steer/interrupt as a first-class API.
- Time horizon: minutes to hours (vs Gemini's days).
- Multi-agent and "outcomes" are research preview, request-access.
- Pricing: $0.08/session-hour, metered to the millisecond.
- Single model family (Claude only).

## Is Gemini "better" than Claude Managed Agents?

Wrong question — they sit at different layers.

| | Claude Managed Agents | Gemini Enterprise |
|---|---|---|
| Category | Agent runtime primitive | Full agent platform |
| Models | Claude only | 200+ incl. Claude |
| Governance / eval / registry | None | Best-in-class |
| Time horizon | Minutes–hours | Days |
| Maturity | Beta + research-preview pieces | GA |
| Integration cost | Tiny (4 concepts) | Large |
| Lock-in shape | Single model | Single cloud |

For a 40+ dev team on managed-only, **Gemini Enterprise is the more
defensible choice** — its governance/eval/identity stack is exactly what an
org that size eventually needs and would otherwise have to build. Claude
Managed Agents is what you reach for when one team wants to ship one agent
fast.

Important: because Gemini Enterprise hosts Claude models in Model Garden,
"Claude on Gemini Enterprise" is a real option. But the *harness* is
different — Anthropic's harness ships with skills, compaction, and prompt
caching tuned for Claude. Going through Gemini's runtime, you get the model
but not the harness. That is a real capability difference, not just routing.

## Capability-based abstraction layer

A small core every backend supports, plus progressive-enhancement hooks for
platform-specific features. Pattern is well-known (LiteLLM for models,
Vercel framework adapters for hosting, OTel for tracing).

```
runtime.invoke(workflowOrAgent, input) → handle
runtime.stream(handle) → AsyncIterable<Event>
runtime.get(handle) → state
runtime.cancel(handle)
runtime.list(filter)
```

That is the LCD. Everything else (Memory Bank, ADK graphs, Inngest step
memoization, Claude's mid-flight steer, OpenAI Responses container) lives
behind capability flags:

```ts
if (runtime.capabilities.memory) runtime.memory.upsert(...)
if (runtime.capabilities.steer)   runtime.steer(handle, msg)
if (runtime.capabilities.eval)    runtime.eval.simulate(...)
```

The UI exposes optional features only when the active backend reports them.
Users get a consistent shell; per-platform power isn't hidden, it's gated.

### Why it's worth doing

1. **Negotiating leverage** — once switching is cheap, vendor pricing
   conversations change.
2. **Per-workflow routing** — short deterministic glue → Inngest. Long
   agentic reasoning → Gemini Enterprise. Heavy coding agents → Claude
   Managed. Same UI, right tool per job. Strongest argument.
3. **It matches how the bench already thinks.** `workflow.md` is
   platform-neutral; each `services/<platform>/` implements it.
   Productionizing the bench's mental model is the natural next step.

### Risks to design against

- Don't let the core grow. Adding "memory" to the core puts you back in
  LCD-or-leak. Capabilities are strictly opt-in.
- Don't model events generically. Each platform's stream has different
  semantics. Coarse `{type, ts, payload}` envelope; let UIs render
  platform-specific subtypes.
- State migration mid-flight is not a feature. Routing is choice-time, not
  runtime.
- Test with two backends before adding a third. Build for three from day
  one and you'll over-abstract.

### Recommended target backends

Three is the right number — they cover distinct use cases:

- **Inngest (self-hosted)** — deterministic, cheap, fast local dev,
  code-as-orchestrator
- **Gemini Enterprise** — long-running agents, governance, eval, multi-model
  (incl. Claude)
- **Claude Managed Agents** — simple agent runtime, best-in-class
  agentic-code quality, less ceremony

## Standardized workflow spec — what's realistic

The honest target is **~85% cross-compile clean, with documented
fidelity loss for the rest**. 99% is the wrong target — BPMN, AWS Step
Functions ASL, and Temporal Cloud's workflow defs all aim higher and land
around 80%.

The split that makes it tractable: two spec kinds.

### Pipeline spec
Ordered/branching steps, typed IO, failure policy. Native compile to
Inngest and ADK Sequential/Parallel/Loop. Degrades to Claude Managed via
skills + forcing system prompt — no durable replay (flag it).

### Agent spec
Goal, tool list (MCP), guardrails, memory hints, budget. Native compile to
Claude Managed and ADK single-agent + Memory Bank. Degrades to Inngest by
wrapping `step.ai` in a manual loop — loses harness niceties (flag it).

Most workflows are clearly one or the other. Hybrids compose: a pipeline
spec with an `agent` step that contains an agent spec.

### Sketch

```yaml
kind: pipeline   # or: agent
id: arxiv-to-slack
inputs:
  query: string
  channel: string
steps:
  - id: fetch
    tool: http.get
    input: { url: "https://export.arxiv.org/api/query?{{query}}" }
    retry: { max: 3, backoff: exponential }
  - id: parse
    tool: xml.extract
    input: { xml: "{{fetch.body}}", path: "//entry[1]" }
  - id: post
    tool: slack.postMessage
    input: { channel: "{{channel}}", text: "{{parse.title}}" }
    onFailure: { fallback: email.send }
guarantees:
  idempotencyKey: "{{query}}:{{date}}"
  determinism: required
platforms:
  inngest: {}
  gemini:  { runtime: agent-runtime-medium }
  claude:  { skip: true, reason: "determinism: required" }
```

Three things make this work:
1. **Typed tool contracts** — tools resolve against a registry; each
   platform's compiler maps to its idiom.
2. **Explicit guarantees** — `determinism: required`, `maxDuration`,
   `idempotencyKey`. Compiler reads these to decide if a target is even
   eligible. Drop targets that can't honor the guarantee instead of
   silently degrading.
3. **Per-platform overrides** — the 10-15% that doesn't translate lives
   here, scoped and visible.

### The compiler is the easy part

`BUILD_PROMPT.md` is already a one-shot compiler from prose spec → platform
code. Tighten the input from prose to structured spec and you get reliable
per-platform codegen with the LLM doing the platform-idiom translation.
The bench loop becomes the test suite for the abstraction.

## Honest fit ratings — current `workflows/` library

Scored 1–10 for *fit to this spec*, not platform quality.

| Workflow | Inngest | Gemini Enterprise | Claude Managed |
|---|---|---|---|
| arxiv-ai-to-slack | 10 | 5 | 2 |
| hn-digest | 10 | 6 | 3 |
| lead-lifecycle | 10 | 4 | 1 |
| reddit-ai-norwegian | 10 | 6 | 3 |

### Per-workflow honest reads

**arxiv-ai-to-slack** — 2-step linear pipeline. Inngest is tailor-made.
Gemini Enterprise works but is architectural overkill. Claude Managed is
the wrong shape entirely — paying $0.08/session-hour for a deterministic
fetch-and-post.

**hn-digest** — Inngest hits every primitive natively. Gemini ParallelAgent
works and free Gemini Flash is a real freebie, but the spec demands "30
individual steps visible in dashboard" — ADK's observability is
agent-trace-shaped, not step-shaped. Claude Managed fails three of four
success criteria (per-step durability, dashboard step count,
date-idempotency).

**lead-lifecycle** — Every primitive in the spec is a literal Inngest
primitive. Gemini fits poorly: `waitForEvent`-with-correlation-key isn't
first-class, loop-back-from-step-4-to-step-2 is awkward. Claude Managed is
a severe mismatch — this is a control-plane workflow, not an agentic task.

**reddit-ai-norwegian** — Linear 4-step pipeline with one LLM translation.
Inngest native. Gemini works but overkill. Claude Managed shoehorns a
deterministic pipeline through an agent loop — partial-failure semantics
get lost.

### The brutal meta-observation

**Every workflow in the library is pipeline-shaped.** That's why Inngest is
winning the bench — the bench is testing the dimension Inngest is built
for. Claude Managed Agents scores 1–3 across the board not because it's a
bad platform, but because **it's not the same kind of platform**. We're
rating a sports car on its tractor performance.

The cross-platform abstraction story is unfalsifiable in Inngest's favor as
long as every workflow we compile is one Inngest already wins.

### Workflows missing from the library

To make the bench honest about the agent-platform side, the library needs
2–3 agent-shaped workflows:

- **"Investigate this incident"** — Sentry payload in; agent navigates
  logs/code/git history; opens a PR with a fix or writes an RCA. Open
  toolset, no fixed step graph. Estimated fit: Inngest 3, Gemini 8, Claude
  Managed 9.
- **"Triage this support ticket"** — read ticket, search docs and past
  tickets, decide auto-resolve / draft reply / escalate. Memory across
  sessions. Estimated fit: Inngest 4, Gemini 9 (Memory Bank shines),
  Claude Managed 8.
- **"Refactor this module"** — long-running coding task with bash + file
  ops + tests. Estimated fit: Inngest 2, Gemini 7, Claude Managed 10
  (this is what the harness was built for).

Adding these would jump the library's value-as-bench from ~5/10 to ~8/10
for proving the three-platform abstraction is worthwhile.

## Open questions

- Should managed agent platforms get their own scoring rubric (governance,
  eval, memory weighted higher; portability + local-dev weighted lower) and
  a separate table in `COMPARISON.md`? Probably yes — forcing them into the
  durable-workflow rubric is unfair in both directions.
- Is "Claude on Gemini Enterprise" a fourth distinct target, or just a
  configuration of the Gemini target? Lean: configuration, not target —
  unless the Anthropic harness becomes available standalone outside
  Anthropic's cloud.
- How does this interact with the team-language constraint (TS or Python)?
  All three target backends support both — no constraint added.

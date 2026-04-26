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

## Position after research

If self-hosting is dropped, managed agent platforms should get their own
table and rubric. They should not be folded into the same weighted ranking as
Temporal/Inngest/DBOS. The score below is **fit as a managed agent platform
for Frontkom clients**, not fit as a durable workflow engine.

| Platform | Best fit | Managed-agent fit | Durable-workflow replacement |
|---|---|---:|---:|
| Gemini Enterprise | Enterprise-wide agent adoption: governance, registry, evals, memory, connectors, employee-facing app | 9/10 | 4/10 |
| Claude Managed Agents | Long-running coding, ops, investigation, and research agents with a strong hosted harness | 8/10 | 4/10 |
| OpenAI AgentKit | Product-facing agent UX, Agent Builder, ChatKit, guardrails, evals, connector registry | 8/10 | 5/10 |
| Temporal / Inngest / DBOS class | Deterministic control-plane workflows, approvals, timers, retries, event correlation | 4/10 as agents | 9/10 |

What we miss if we let go of self-hosted workflow engines:

- Deterministic workflow semantics: replay, versioning, durable step
  boundaries, and explicit IO memoization.
- First-class event correlation: `waitForEvent`/signals with business keys,
  approval tokens, and timeout behavior that is code-defined rather than
  harness-inferred.
- Repo-as-source-of-truth: ordinary PR review of every flow change.
- Private data-plane control: running next to client databases and internal
  services without routing through a vendor agent runtime.
- Portability at the semantic layer: moving a pipeline between engines is
  painful but understandable; moving provider-specific agent memory, evals,
  hosted tools, and UI state is much less portable.
- Operational transparency: workflow journals are not the same thing as
  agent traces. Traces explain behavior; journals are part of the correctness
  mechanism.

## What Gemini Enterprise actually offers (Next '26)

- **Gemini Enterprise app** — an employee-facing front door with Agent
  Gallery, sharing, and centralized oversight for Google-made, organization,
  ADK, A2A, Dialogflow, and no-code/low-code agents.
- **Agent Designer** — prompt-to-agent creation plus a visual flow builder for
  multi-step/subagent flows. Schedules are available from the designer.
- **Agent Runtime / Agent Platform** — fully managed Google Cloud runtime for
  ADK agents and other frameworks. Cloud-only as a managed service.
- **ADK** — open-source agent framework in Python, TypeScript, Go, and Java.
  Supports predictable workflow agents and more dynamic multi-agent routing.
- **Sessions + Memory Bank** — managed short-term session state and long-term
  memories, with IAM Conditions for access control.
- **Governance** — Agent Identity, Agent Registry, Agent Gateway, policies,
  Model Armor integration, VPC-SC/private networking controls, and Google
  Cloud observability.
- **Eval / optimization** — Example Store, offline evaluations, behavior
  simulation, online monitors, failure clustering, quality alerts, prompt
  optimization, traces, and relationship views.
- **Tools / execution** — Code Execution and Computer Use are part of the
  managed platform surface.
- **Interop** — MCP, A2A, and AP2/payment-protocol positioning.
- **Models** — Gemini models plus partner models through Vertex AI / Model
  Garden, including Claude Opus/Sonnet/Haiku.
- **Pricing** — Agent Runtime and Code Execution are compute/memory-metered;
  Sessions and Memory Bank are separately metered. This is operationally
  simpler than self-hosting, but not cost-neutral.

Caveat: custom ADK agents must be hosted and maintained on Agent Platform to
appear inside Gemini Enterprise. Gemini Enterprise is excellent as a governed
enterprise agent surface; it is not a direct replacement for a deterministic
workflow journal.

## What Claude Managed Agents actually offers (April 2026, beta)

- Four concepts: Agent / Environment / Session / Events.
- Built-in tools: Bash, file ops, web search/fetch, MCP servers.
- Server-side event history; Anthropic's architecture separates the session
  log from the harness so a failed harness can resume from the stored events.
- SSE streaming; mid-flight steer/interrupt as a first-class API.
- Time horizon: minutes to hours (vs Gemini's days).
- Multi-agent and "outcomes" are research preview, request-access.
- Pricing: $0.08/session-hour, metered to the millisecond.
- Single model family (Claude only).

Claude's main value is the harness, not just the model: built-in prompt
caching, compaction, file/code tools, permissions, sessions, and the same
agent-loop style that powers Claude Code. That makes it very attractive for
coding agents, incident investigation, research, and other long-running tasks
where the system needs to keep working through tool feedback.

## What OpenAI AgentKit actually offers (April 2026)

- **Agent Builder** — visual canvas for composing and versioning multi-agent
  workflows, connecting tools, configuring guardrails, previewing runs, and
  attaching evals. Beta.
- **Agents SDK / Responses API** — code-first path for building agents where
  the application owns more of the orchestration.
- **ChatKit** — embeddable chat UI for product-facing agent experiences.
- **Connector Registry** — admin-managed connectors across ChatGPT and API
  orgs, including common SaaS/document sources and third-party MCPs. Beta
  rollout for eligible enterprise/edu/API organizations.
- **Guardrails** — modular guardrail layer for PII handling, jailbreak
  detection, and related controls, usable in Agent Builder or standalone.
- **Evals** — datasets, trace grading, automated prompt optimization, and
  third-party model support.

Caveat: AgentKit is compelling if Frontkom wants to ship agent experiences
inside client products. It is less convincing as the neutral backend for
approval-heavy durable workflows because Agent Builder is visual-first and the
standalone workflow/deployment story is still maturing.

## Is Gemini "better" than Claude or OpenAI?

Wrong question — they sit at different layers.

| | Claude Managed Agents | Gemini Enterprise | OpenAI AgentKit |
|---|---|---|---|
| Category | Agent runtime primitive | Full enterprise agent platform | Agent product toolkit + platform |
| Strongest layer | Harness + sandbox + sessions | Governance + registry + eval + enterprise data | Agent UX + eval + OpenAI ecosystem |
| Models | Claude only | Gemini + partner models incl. Claude | OpenAI models, with eval support for third-party models |
| Governance / eval / registry | Limited platform governance | Strongest | Strong eval/guardrails, connector registry still rolling out |
| Time horizon | Minutes-hours | Longer enterprise agent/runtime use cases | Product/workflow dependent |
| Maturity | Beta + research-preview pieces | Broad platform, some features pre-GA | Mixed: ChatKit/evals GA, Agent Builder beta |
| Integration cost | Tiny API surface | Large Google Cloud platform surface | Moderate; high if adopting visual builder deeply |
| Lock-in shape | Single model family + Anthropic harness | Single cloud/control plane | Single model/platform ecosystem |

For a 40+ dev team on managed-only, **Gemini Enterprise is the more
defensible choice** — its governance/eval/identity stack is exactly what an
org that size eventually needs and would otherwise have to build. Claude
Managed Agents is what you reach for when one team wants to ship one agent
fast, especially a coding or ops agent. OpenAI AgentKit is strongest when the
deliverable is an embedded agent product experience with managed chat UI,
guardrails, evals, and connectors.

Important: because Gemini Enterprise hosts Claude models in Model Garden,
"Claude on Gemini Enterprise" is a real option. But the *harness* is
different — Anthropic's harness ships with skills, compaction, and prompt
caching tuned for Claude. Going through Gemini's runtime, you get the model
but not the harness. That is a real capability difference, not just routing.

## Capability-based abstraction layer

A shared Frontkom UI/control plane is worth building, but it should sit above
two backend classes, not one fake universal runtime.

### WorkflowBackend

For deterministic pipelines, approvals, timers, retries, idempotency, and
event correlation:

```
workflow.invoke(pipelineSpec, input) → handle
workflow.signal(handle, event)
workflow.approve(handle, decision)
workflow.get(handle) → state
workflow.cancel(handle)
workflow.list(filter)
```

### AgentBackend

For model-driven work, tools, memory, sessions, streaming, and mid-flight
steering:

```
agent.invoke(agentSpec, input) → handle
agent.stream(handle) → AsyncIterable<Event>
agent.steer(handle, message)
agent.get(handle) → state
agent.cancel(handle)
agent.list(filter)
```

The UI can still feel unified: same run list, same run detail shell, same
approval inbox, same audit view. The backend adapter reports capabilities and
the UI exposes optional features only when the active backend supports them.

```ts
if (backend.capabilities.memory) backend.memory.upsert(...)
if (backend.capabilities.steer) backend.steer(handle, msg)
if (backend.capabilities.eval) backend.eval.simulate(...)
```

Routing happens at design/deploy time. If a spec requires deterministic
event correlation, only WorkflowBackend targets are eligible. If it requires
open-ended tool use, persistent memory, or browser/code execution, AgentBackend
targets become eligible. State migration mid-flight is explicitly out of
scope.

### Why it's worth doing

1. **Negotiating leverage** — once switching is cheap, vendor pricing
   conversations change.
2. **Per-workflow routing** — deterministic approval flow → Temporal/Inngest.
   Long enterprise agent → Gemini Enterprise. Heavy coding/ops agent → Claude
   Managed. Product-facing chat agent → OpenAI AgentKit. Same UI, right tool
   per job. Strongest argument.
3. **It matches how the bench already thinks.** `workflow.md` is
   platform-neutral; each `services/<platform>/` implements it.
   Productionizing the bench's mental model is the natural next step.

### Risks to design against

- Don't let the core grow. Adding "memory" to the core puts you back in
  LCD-or-leak. Capabilities are strictly opt-in.
- Don't model events generically. Each platform's stream has different
  semantics. Coarse `{type, ts, payload}` envelope; let UIs render
  platform-specific subtypes.
- Test with two backends before adding more. Build for every provider from
  day one and you'll over-abstract.

### Recommended target backends

Start with two adapters to prove the shape, then add the rest. Strategic
coverage should include:

- **Temporal or Inngest (WorkflowBackend)** — deterministic, code-reviewed
  orchestration. Temporal is the stronger consultancy standard; Inngest is the
  lightweight TS/local-dev adapter.
- **Gemini Enterprise** — long-running agents, governance, eval, multi-model
  (incl. Claude)
- **Claude Managed Agents** — simple agent runtime, best-in-class
  agentic-code quality, less ceremony
- **OpenAI AgentKit** — embedded agent UX, ChatKit, guardrails, evals, and
  connector registry when the client product itself needs an agent surface

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

| Workflow | Inngest | Gemini Enterprise | Claude Managed | OpenAI AgentKit |
|---|---:|---:|---:|---:|
| arxiv-ai-to-slack | 10 | 5 | 2 | 4 |
| hn-digest | 10 | 6 | 3 | 5 |
| lead-lifecycle | 10 | 4 | 1 | 3 |
| reddit-ai-norwegian | 10 | 6 | 3 | 5 |

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

**OpenAI AgentKit overall** — more natural than Claude Managed for product
UX and eval-heavy agent experiences, but still the wrong center of gravity for
these four workflows. Agent Builder can model steps, but the success criteria
here are durable workflow criteria, not agent UX criteria.

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
  Managed 9, OpenAI AgentKit 8.
- **"Triage this support ticket"** — read ticket, search docs and past
  tickets, decide auto-resolve / draft reply / escalate. Memory across
  sessions. Estimated fit: Inngest 4, Gemini 9 (Memory Bank shines),
  Claude Managed 8, OpenAI AgentKit 9.
- **"Refactor this module"** — long-running coding task with bash + file
  ops + tests. Estimated fit: Inngest 2, Gemini 7, Claude Managed 10
  (this is what the harness was built for), OpenAI AgentKit 7.

Adding these would jump the library's value-as-bench from ~5/10 to ~8/10
for proving the multi-backend abstraction is worthwhile.

## Proposed managed-agent rubric

If these platforms are added to the bench, use a separate rubric:

- **Agent harness quality (25%)** — long-running sessions, tool feedback,
  interruptions, compaction, recoverability, and ability to keep working
  without a custom loop.
- **Enterprise governance (20%)** — identity, permissions, registry, policy,
  audit, data controls, and admin visibility.
- **Tooling and connectors (15%)** — built-in tools, MCP/A2A support,
  enterprise data connectors, browser/code execution, and custom tool support.
- **Evaluation and observability (15%)** — traces, simulations, eval datasets,
  online monitors, quality alerts, and failure analysis.
- **AI authoring and reviewability (10%)** — how well an LLM can author and
  modify the agent, and how well humans can review the result in PRs.
- **Portability and exit cost (10%)** — model portability, hosted-state export,
  code-first definitions, and ability to move between vendors.
- **Cost predictability (5%)** — understandable billing units, idle behavior,
  and ability to cap spend per run/session.

This rubric intentionally weights governance, harness, memory, evals, and
connectors higher than the durable-workflow rubric. That is the point: it
tests the category on the things managed agent platforms are supposed to win.

## Open questions

- Should managed agent platforms get their own scoring rubric and separate
  table in `COMPARISON.md`? Yes.
- Is "Claude on Gemini Enterprise" a fourth distinct target, or just a
  configuration of the Gemini target? Lean: configuration, not target —
  unless the Anthropic harness becomes available standalone outside
  Anthropic's cloud.
- How does this interact with the team-language constraint (TS or Python)?
  The managed-agent targets all have TypeScript and/or Python paths, and the
  workflow targets already match the repo's TS/Python constraint. No new hard
  language constraint is added.
- Should OpenAI AgentKit be treated as a backend target or a UI/tooling
  option? Lean: backend target only when a client needs an embedded
  product-facing agent surface; otherwise use OpenAI models/tools through a
  thinner AgentBackend adapter.

## Source anchors

- Gemini Enterprise Agent Designer: https://docs.cloud.google.com/gemini/enterprise/docs/agent-designer/create-agent
- Gemini Enterprise Agent Platform scale/runtime: https://docs.cloud.google.com/gemini-enterprise-agent-platform/scale
- Gemini Enterprise ADK overview: https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/adk
- Gemini ADK registration caveat: https://docs.cloud.google.com/gemini/enterprise/docs/register-and-manage-an-adk-agent
- Claude Managed Agents overview: https://platform.claude.com/docs/en/managed-agents/overview
- Claude Managed Agents architecture: https://www.anthropic.com/engineering/managed-agents
- Claude Managed Agents pricing: https://platform.claude.com/docs/en/docs/about-claude/pricing
- OpenAI AgentKit announcement: https://openai.com/index/introducing-agentkit/
- OpenAI agent platform: https://openai.com/agent-platform/

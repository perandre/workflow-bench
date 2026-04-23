# Lead Lifecycle (Slack-only simulation)

Structurally mirrors a B2B customer journey (awareness → consideration → decision → implementation → follow-up) using only Slack as an external integration. Waits are compressed to seconds so the full flow runs in under ~1 minute.

## Trigger

Event: `lead.submitted`
Payload: `{ leadId: string, name: string, email: string, interest: string }`

## Steps

1. **Acknowledge (idempotent)**
   - Dedupe on `leadId` within a 24h window. Second submission with same id within window = no-op.
   - Post "New lead: {name} — {interest}" to Slack `#sales`.

2. **Consideration nudge**
   - Durable sleep 10s (stand-in for "X virkedager").
   - Post reminder to `#sales` with 3 action buttons: `Proposal` / `More info` / `Drop`.

3. **HITL decision**
   - `waitForEvent("lead.decision", matching leadId, timeout: 30s)`.
   - On timeout → treat as `Drop` and log timeout reason.

4. **Branch on decision**
   - **Proposal** → parallel fan-out (both must succeed):
     - Post contract-draft summary to `#sales`.
     - Post "prep onboarding" to `#delivery`.
   - **More info** → loop back to step 2. Max 2 iterations; then force-drop.
   - **Drop** → post "lead cold" to `#sales`, end.

5. **Signature wait**
   - `waitForEvent("lead.signed", matching leadId, timeout: 20s)`.
   - On signed → continue. On timeout → post escalation to `#sales-leads`, end.

6. **Implementation fan-out (parallel, all must succeed)**
   - Welcome DM/post to lead's channel.
   - Internal "delivery kickoff" post to `#delivery`.
   - "Invoice queued" post to `#finance`.
   - Inject random 30% failure in one of these steps to exercise retries. Retries should be visible in the platform's UI/logs.

7. **Follow-up (delayed)**
   - Durable sleep 15s.
   - Post NPS-style survey message to `#sales`.

## Platform-stressing features

| Feature | Reveals |
|---|---|
| Durable sleep + waitForEvent with timeout | Timer/event-correlation infra |
| Conditional branching with loop-back (max iterations) | DAG vs code-first ergonomics |
| Parallel fan-out, all-must-succeed | Step parallelism + partial-failure semantics |
| Injected 30% failure + retries | Retry config, backoff, failure observability |
| Idempotency on leadId | Production-grade dedupe |

## Good results

- Happy path completes in <30s wall-clock (with compressed waits).
- Retries visible in UI with attempt count and error detail.
- `waitForEvent` timeout transitions cleanly to fallback branch.
- Second submission with same `leadId` within dedupe window is a no-op.
- Parallel steps render as concurrent on the timeline.

## Test triggers

- Happy path: submit → send `lead.decision=Proposal` within 30s → send `lead.signed` within 20s.
- Drop path: submit → send `lead.decision=Drop`.
- Timeout path: submit → don't send any decision event.
- Loop path: submit → send `lead.decision=More info` twice.
- Idempotency: submit the same `leadId` twice within 10s.

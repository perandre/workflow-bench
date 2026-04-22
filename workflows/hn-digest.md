## The workflow: "Daily HN AI Digest"

Trigger: cron, every day at 08:00 UTC. Also invokable manually for testing.

Steps:

1. **Fetch top 30 story IDs** from HackerNews (`https://hacker-news.firebaseio.com/v0/topstories.json`).
2. **Fetch each story's metadata in parallel** (`/item/{id}.json`). Each fetch is its own durable step — if one fails, skip that story, don't fail the run.
3. **Filter** to stories with `score >= 100` and a `url` field.
4. **Summarize each in parallel** using the Google Gemini API (model `gemini-2.5-flash`) via the official `@google/genai` SDK or raw `fetch` — one sentence per story plus 3 tags drawn from `["ai", "dev-tools", "startup", "science", "security", "other"]`. Request structured JSON output (`responseMimeType: "application/json"` with a schema). Each LLM call is its own durable step with retry.
5. **Rank**: `final_score = hn_score + 20 × (tags includes "ai") + 10 × (tags includes "dev-tools")`.
6. **Post the top 5** to Slack via `chat.postMessage` (Slack Web API) using bot token `SLACK_BOT_TOKEN` and channel `SLACK_DIGEST_CHANNEL`. Format as a single markdown message: bullet per story with title, summary, tags, and URL. The message header must include the platform name — e.g. `*Daily HN AI Digest — 2026-04-22* [Inngest]`.

Available env vars: `GOOGLE_API_KEY`, `SLACK_BOT_TOKEN`, `SLACK_DIGEST_CHANNEL`, `SLACK_PREVIEW_CHANNEL`

No mocks, no stubs — real HN API, real Gemini API, real Slack Web API.

## Success criteria

- All 30 HN fetch steps visible as individual steps in the dashboard
- Top 5 digest message appeared in Slack (`SLACK_DIGEST_CHANNEL`)
- Run completed without unhandled exceptions
- Triggering a second time on the same UTC date does NOT produce a duplicate Slack post

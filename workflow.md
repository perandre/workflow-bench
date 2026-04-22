## The workflow: "Daily HN AI Digest"

Fetch top 30 HackerNews stories, summarise each with Google Gemini AI, rank by score + AI/dev-tools tags, post top 5 to Slack. Tests parallel durable steps, LLM integration, and idempotency.

## Success criteria

All 30 HN fetch steps visible as individual steps in dashboard. Top 5 digest message appeared in Slack. No duplicate post on second trigger same day.

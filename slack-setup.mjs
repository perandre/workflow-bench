import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDS_PATH = "/Users/pesh/.slack/credentials.json";
const TEAM_ID = "T02NCLXV2";
const REDIRECT_URI = "http://localhost:3007/oauth/callback";
const ENV_OUT = path.join(__dirname, "shared-secrets.env");
const APP_STATE = path.join(__dirname, ".slack-app.json");

const configToken = JSON.parse(fs.readFileSync(CREDS_PATH, "utf8"))[TEAM_ID].token;

async function slack(endpoint, body, token = configToken) {
  const res = await fetch(`https://slack.com/api/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body ?? {}),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`${endpoint} failed: ${JSON.stringify(json)}`);
  return json;
}

async function createApp() {
  const manifest = {
    display_information: {
      name: "Workflow Bench",
      description: "Posts benchmark digests from durable workflows",
    },
    features: {
      bot_user: { display_name: "Workflow Bench", always_online: false },
    },
    oauth_config: {
      redirect_urls: [REDIRECT_URI],
      scopes: {
        bot: [
          "chat:write",
          "channels:manage",
          "channels:read",
          "channels:join",
          "groups:write",
        ],
      },
    },
    settings: {
      org_deploy_enabled: false,
      socket_mode_enabled: false,
      token_rotation_enabled: false,
    },
  };
  const r = await slack("apps.manifest.create", { manifest });
  fs.writeFileSync(
    APP_STATE,
    JSON.stringify(
      { app_id: r.app_id, client_id: r.credentials.client_id, client_secret: r.credentials.client_secret },
      null,
      2
    )
  );
  console.log(`[ok] app created: ${r.app_id}`);
  return { app_id: r.app_id, client_id: r.credentials.client_id, client_secret: r.credentials.client_secret };
}

function authorizeUrl(client_id) {
  const scope = "chat:write,channels:manage,channels:read,channels:join,groups:write";
  const u = new URL("https://slack.com/oauth/v2/authorize");
  u.searchParams.set("client_id", client_id);
  u.searchParams.set("scope", scope);
  u.searchParams.set("redirect_uri", REDIRECT_URI);
  u.searchParams.set("state", "bench");
  return u.toString();
}

function waitForCode(client_id, client_secret) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const u = new URL(req.url, "http://localhost:3007");
      if (u.pathname !== "/oauth/callback") {
        res.writeHead(404).end();
        return;
      }
      const code = u.searchParams.get("code");
      const err = u.searchParams.get("error");
      if (err) {
        res.writeHead(200, { "Content-Type": "text/html" }).end(`<h1>Auth error</h1><pre>${err}</pre>`);
        server.close();
        reject(new Error(`oauth error: ${err}`));
        return;
      }
      if (!code) {
        res.writeHead(400).end("missing code");
        return;
      }
      try {
        const exchange = await fetch("https://slack.com/api/oauth.v2.access", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id,
            client_secret,
            code,
            redirect_uri: REDIRECT_URI,
          }),
        });
        const j = await exchange.json();
        if (!j.ok) throw new Error(JSON.stringify(j));
        res
          .writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
          .end(`<h1>Installed ✓</h1><p>You can close this tab — setup continues in the terminal.</p>`);
        server.close();
        resolve(j);
      } catch (e) {
        res.writeHead(500).end(String(e));
        server.close();
        reject(e);
      }
    });
    server.listen(3007, () => console.log("[ok] callback server listening on http://localhost:3007"));
  });
}

async function ensureChannel(botToken, name) {
  try {
    const r = await slack("conversations.create", { name, is_private: false }, botToken);
    return { id: r.channel.id, created: true };
  } catch (e) {
    const msg = String(e.message);
    if (!msg.includes("name_taken")) throw e;
    // Look up existing
    const list = await fetch(
      `https://slack.com/api/conversations.list?types=public_channel&limit=1000`,
      { headers: { Authorization: `Bearer ${botToken}` } }
    ).then((r) => r.json());
    const ch = list.channels.find((c) => c.name === name);
    if (!ch) throw new Error(`channel ${name} not resolvable`);
    await slack("conversations.join", { channel: ch.id }, botToken).catch(() => {});
    return { id: ch.id, created: false };
  }
}

async function main() {
  const { client_id, client_secret } = await createApp();
  const authUrl = authorizeUrl(client_id);
  console.log("\n╔════════════════════════════════════════════════════════════");
  console.log("║ CLICK THIS URL IN A BROWSER TO INSTALL THE BENCH APP:");
  console.log("║ " + authUrl);
  console.log("╚════════════════════════════════════════════════════════════\n");
  console.log("Waiting for OAuth callback…");

  const install = await waitForCode(client_id, client_secret);
  const botToken = install.access_token;
  console.log(`[ok] bot installed (team=${install.team.name}, bot_id=${install.bot_user_id})`);

  const preview = await ensureChannel(botToken, "bench-preview");
  const digest = await ensureChannel(botToken, "bench-digest");
  console.log(`[ok] #bench-preview → ${preview.id} (${preview.created ? "created" : "exists"})`);
  console.log(`[ok] #bench-digest → ${digest.id} (${digest.created ? "created" : "exists"})`);

  // Smoke test
  await slack("chat.postMessage", { channel: preview.id, text: "Bench preview channel live ✓" }, botToken);
  await slack("chat.postMessage", { channel: digest.id, text: "Bench digest channel live ✓" }, botToken);
  console.log("[ok] test messages posted to both channels");

  // Preserve the ANTHROPIC_API_KEY if it's already set in the env file
  let existing = "";
  if (fs.existsSync(ENV_OUT)) existing = fs.readFileSync(ENV_OUT, "utf8");
  const anthropic = (existing.match(/ANTHROPIC_API_KEY=.*/) || [""])[0];

  const envBody = [
    "# Generated by slack-setup.mjs. Do not commit.",
    anthropic || "ANTHROPIC_API_KEY=",
    `SLACK_BOT_TOKEN=${botToken}`,
    `SLACK_PREVIEW_CHANNEL=${preview.id}`,
    `SLACK_DIGEST_CHANNEL=${digest.id}`,
    "",
  ].join("\n");
  fs.writeFileSync(ENV_OUT, envBody);
  console.log(`[ok] wrote ${ENV_OUT}`);
  console.log("\nDone. Check #bench-preview and #bench-digest in Slack for the test pings.");
  process.exit(0);
}

main().catch((e) => {
  console.error("[fail]", e.message);
  process.exit(1);
});

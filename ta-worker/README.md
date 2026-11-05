# TA Worker

The small server between TA (Taylor's teaching assistant) and the AI model. It keeps the API key secret, looks up per-application presets, enforces limits, and streams answers back to the site.

## How a question flows

1. The site loads. If the URL has `?for=<key>`, it calls `GET /preset` for the tailored greeting and featured case studies.
2. Common questions are answered from `src/scripted.json`: instant, free, no AI.
3. For a typed question, the site gets a session from `POST /session` (one invisible bot check), then calls `POST /chat`.
4. The Worker checks origin → session → per-visitor rate limit → kill switch → daily cap → message length.
5. The model answers only from TA's "lesson plans": the site's case studies and resume, read from `ta-knowledge.json` and `/resume/`.
6. The answer streams back. Its last line, `SOURCES: …`, is cleaned so TA can only cite files that exist.
7. The question and answer are logged anonymously (no IP addresses) and deleted after 30 days.

## Guardrail layers

| Layer | Where | What it stops |
|---|---|---|
| No tools, no actions, public knowledge only | Architecture | Worst case is a wrong sentence, not a leak or an action |
| Origin check, bot check, sessions | `index.js`, `guard.js` | Other sites and bots using TA as a free AI |
| Rate limit, daily cap, provider spending limit | `wrangler.toml`, provider console | Runaway cost |
| Message length, history cleanup | `guard.js` | Long injection attacks, fake "system" turns |
| System prompt rules | `system-prompt.txt` | Off-topic answers, made-up facts, private topics |
| Server-side preset lookup | `index.js` | Visitors injecting a fake company or context |
| Sources filter | `guard.js` | Citing case studies that don't exist |
| Answer length cap | `guard.js` | Long off-topic output |
| Red-team checks | `evals/` | Regressions when the prompt, model or content changes |
| Logs + kill switch | D1, `LLM_ENABLED` | Lets Taylor spot problems and turn the AI off in one step |

## First-time setup (on a computer)

1. `npm install`
2. `npx wrangler login`
3. Create storage, then paste the ids into `wrangler.toml`:
   - `npx wrangler kv namespace create PRESETS`
   - `npx wrangler d1 create ta-log`
   - `npx wrangler d1 execute ta-log --remote --file=schema.sql`
4. Create a Turnstile widget in the Cloudflare dashboard for `taylortrujillo.me` (and `localhost`). Keep the site key for the site and the secret for step 5.
5. Set secrets:
   - `npx wrangler secret put SESSION_SECRET` (any long random string)
   - `npx wrangler secret put TURNSTILE_SECRET`
   - `npx wrangler secret put EVAL_KEY` (any long random string; only for the eval script)
   - Later, when switching to Claude: `npx wrangler secret put ANTHROPIC_API_KEY`
6. `npx wrangler deploy`
7. Make sure the site is deployed with `ta-knowledge.json` (it's built automatically by `src/pages/ta-knowledge.json.ts`).
8. Run the checks: `TA_URL=https://ta-worker.<your-subdomain>.workers.dev EVAL_KEY=… npm run eval`

## Everyday tasks

- **Add a job:** add an entry to `presets.json` (copy `presets.example.json`; this file is git-ignored), then `npm run presets:upload`. It checks for typos in tracks, skills and case study names first.
- **Retire a job:** set `"status": "archived"`. Old links keep working without naming the company.
- **Turn the AI off:** set `LLM_ENABLED = "false"` and `npx wrangler deploy`. TA falls back to scripted answers.
- **Switch to Claude:** set `PROVIDER = "anthropic"`, add the API key secret, deploy, then run the evals.
- **Review questions:** `npx wrangler d1 execute ta-log --remote --command "SELECT created_at, question, answer, sources FROM questions ORDER BY id DESC LIMIT 20"`
- **Before any change to the prompt, model or content:** `npm test`, then `npm run eval`.

## Notes

- This folder is in a public repo. That's fine: the code, prompt and scripted answers contain nothing private. Presets, secrets and logs never live here.
- Prices and free-tier limits were checked in November 2026 and change often.

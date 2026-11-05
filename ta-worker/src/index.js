// TA Worker: sits between TA on the portfolio site and the LLM.
//
// Routes
//   GET  /preset?for=<key>  → resolved preset (track, company, featured, greeting)
//   POST /session           → bot check (Turnstile) once, returns a short-lived session
//   POST /chat              → streams TA's answer as plain text; last line is SOURCES
//   GET  /health            → status, including whether the LLM is on
//
// Every request passes through, in order: origin check → (chat only) session
// check → per-visitor rate limit → kill switch → daily cap → input validation.

import SYSTEM_PROMPT from './system-prompt.txt';
import SCRIPTED from './scripted.json';
import { createSession, createSourcesFilter, validateChatRequest, verifySession } from './guard.js';
import { loadKnowledge } from './knowledge.js';
import { isValidPresetKey, resolvePreset } from './presets.js';
import { streamAnswer } from './providers.js';

const SESSION_TTL_SECONDS = 30 * 60;
const LOG_RETENTION_DAYS = 30;

// --- Helpers ---------------------------------------------------------------

function allowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim());
  return origin && allowed.includes(origin) ? origin : null;
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-TA-Session',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

// Errors always tell the site to fall back to scripted answers.
const fail = (error, status, origin) => json({ error, fallback: true }, status, origin);

const today = () => new Date().toISOString().slice(0, 10);

async function getStoredPreset(env, key) {
  if (!isValidPresetKey(key)) return null;
  return (await env.PRESETS.get(key, 'json')) ?? null;
}

async function verifyTurnstile(env, token, ip) {
  if (!token) return false;
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  const result = await res.json();
  return result.success === true;
}

async function rateLimited(env, ip) {
  if (!env.TA_LIMITER) return false; // binding not configured
  const { success } = await env.TA_LIMITER.limit({ key: ip ?? 'unknown' });
  return !success;
}

async function overDailyCap(env) {
  const cap = Number(env.DAILY_CAP ?? 300);
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM questions WHERE day = ?')
    .bind(today())
    .first();
  return (row?.n ?? 0) >= cap;
}

function logQuestion(env, entry) {
  return env.DB.prepare(
    `INSERT INTO questions (created_at, day, track, preset, question, answer, sources, outcome)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      new Date().toISOString(),
      today(),
      entry.track ?? null,
      entry.preset ?? null,
      entry.question,
      (entry.answer ?? '').slice(0, 2000),
      (entry.sources ?? []).join(','),
      entry.outcome,
    )
    .run();
}

// --- Routes ----------------------------------------------------------------

async function handlePreset(request, env, origin) {
  const key = new URL(request.url).searchParams.get('for');
  const [stored, knowledge] = await Promise.all([getStoredPreset(env, key), loadKnowledge(env.SITE_URL)]);
  return json(resolvePreset(stored, knowledge.caseStudies, SCRIPTED.trackGreetings), 200, origin);
}

async function handleSession(request, env, origin, ip) {
  const body = await request.json().catch(() => ({}));
  // Automated evals can skip the bot check with a separate secret key.
  const isEval = env.EVAL_KEY && body.evalKey === env.EVAL_KEY;
  if (!isEval && !(await verifyTurnstile(env, body.turnstileToken, ip))) {
    return fail('bot_check_failed', 403, origin);
  }
  return json({ session: await createSession(env.SESSION_SECRET, SESSION_TTL_SECONDS) }, 200, origin);
}

async function handleChat(request, env, ctx, origin, ip) {
  if (!(await verifySession(env.SESSION_SECRET, request.headers.get('X-TA-Session')))) {
    return fail('session_expired', 401, origin);
  }
  if (await rateLimited(env, ip)) return fail('slow_down', 429, origin);
  if (env.LLM_ENABLED !== 'true') return fail('llm_off', 503, origin);
  if (await overDailyCap(env)) return fail('daily_cap', 503, origin);

  const body = await request.json().catch(() => null);
  const input = validateChatRequest(body);
  if (!input.ok) return fail(input.error, 400, origin);

  // Look the preset up again here. The site only sends the key, so a visitor
  // can't inject a fake company or context into TA's instructions.
  const presetKey = isValidPresetKey(body.preset) ? body.preset : null;
  const [stored, knowledge] = await Promise.all([getStoredPreset(env, presetKey), loadKnowledge(env.SITE_URL)]);
  const archived = stored?.status === 'archived';
  const track = ['enablement', 'content', 'ai'].includes(stored?.track)
    ? stored.track
    : ['enablement', 'content', 'ai'].includes(body.track)
      ? body.track
      : null;
  const company = stored && !archived ? stored.company : null;

  const systemCached = `${SYSTEM_PROMPT}\n\n${knowledge.lessonPlans}`;
  const systemVisitor = `<visitor_context>\nTrack: ${track ?? 'unknown'}\nCompany: ${company ?? 'unknown'}\n</visitor_context>`;
  const messages = [...input.history, { role: 'user', content: input.message }];

  const logBase = { track, preset: presetKey, question: input.message };

  let textStream;
  try {
    textStream = await streamAnswer(env, { systemCached, systemVisitor, messages });
  } catch (err) {
    ctx.waitUntil(logQuestion(env, { ...logBase, outcome: 'error', answer: String(err) }));
    return fail('llm_error', 502, origin);
  }

  let resolveDone;
  const done = new Promise((r) => (resolveDone = r));
  const filtered = textStream.pipeThrough(createSourcesFilter(knowledge.validSources, resolveDone));
  ctx.waitUntil(done.then(({ answer, sources }) => logQuestion(env, { ...logBase, answer, sources, outcome: 'answered' })));

  return new Response(filtered.pipeThrough(new TextEncoderStream()), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = allowedOrigin(request, env);
    const ip = request.headers.get('CF-Connecting-IP');

    // Only Taylor's site may call TA (evals use a server-side script).
    if (!origin && url.pathname !== '/health') {
      return new Response('Forbidden', { status: 403 });
    }
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });

    try {
      if (request.method === 'GET' && url.pathname === '/preset') return await handlePreset(request, env, origin);
      if (request.method === 'POST' && url.pathname === '/session') return await handleSession(request, env, origin, ip);
      if (request.method === 'POST' && url.pathname === '/chat') return await handleChat(request, env, ctx, origin, ip);
      if (request.method === 'GET' && url.pathname === '/health') {
        return new Response(JSON.stringify({ ok: true, llm: env.LLM_ENABLED === 'true', provider: env.PROVIDER }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response('Not found', { status: 404 });
    } catch (err) {
      console.error(err);
      return fail('server_error', 500, origin);
    }
  },

  // Daily: delete logged questions older than the retention window.
  async scheduled(_event, env) {
    const cutoff = new Date(Date.now() - LOG_RETENTION_DAYS * 864e5).toISOString();
    await env.DB.prepare('DELETE FROM questions WHERE created_at < ?').bind(cutoff).run();
  },
};

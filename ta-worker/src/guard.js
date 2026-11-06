// Guardrails that live in code, not in the prompt. A prompt can be argued
// with; these can't. Each one limits what a bad request or a bad answer can do.

export const LIMITS = {
  messageChars: 500, // longest visitor message
  historyTurns: 6, // earlier messages sent back to the model
  historyChars: 1200, // longest earlier message kept
  maxOutputTokens: 400, // about 300 words, well above TA's 120-word target
};

// Strip control characters and trim. Keeps newlines and tabs.
function clean(text) {
  return String(text ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

// Validate one incoming chat request. Returns { ok, error } or { ok, message, history }.
export function validateChatRequest(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'bad_request' };

  const message = clean(body.message);
  if (!message) return { ok: false, error: 'empty_message' };
  if (message.length > LIMITS.messageChars) return { ok: false, error: 'message_too_long' };

  // Only keep well-formed turns, alternating roles the model accepts, and
  // never more than the last few. A visitor can't smuggle in a "system" turn.
  const rawHistory = Array.isArray(body.history) ? body.history : [];
  const history = rawHistory
    .filter((t) => t && (t.role === 'user' || t.role === 'assistant'))
    .map((t) => ({ role: t.role, content: clean(t.content).slice(0, LIMITS.historyChars) }))
    .filter((t) => t.content)
    .slice(-LIMITS.historyTurns);
  // The model expects the conversation to start with the visitor.
  while (history.length && history[0].role !== 'user') history.shift();

  return { ok: true, message, history };
}

// The model ends every answer with "SOURCES: slug, slug". This stream filter
// passes the answer through as it arrives, but holds back that last line,
// drops any slug that isn't a real case study (so TA can't cite a made-up
// file), and re-emits a clean SOURCES line at the end.
export function createSourcesFilter(validSlugs, onDone) {
  const PREFIX = 'SOURCES:';
  let line = ''; // text since the last newline, not yet sent
  let held = null; // the SOURCES line, once seen
  let midLine = false; // true once part of the current line has been sent
  let answer = '';

  const emit = (controller, text) => {
    if (!text) return;
    answer += text;
    controller.enqueue(text);
  };

  return new TransformStream({
    transform(chunk, controller) {
      for (const ch of chunk) {
        if (held !== null) {
          // Everything after SOURCES: belongs to it (ignore trailing chatter).
          held += ch;
          continue;
        }
        line += ch;
        if (ch === '\n') {
          emit(controller, line);
          line = '';
          midLine = false;
          continue;
        }
        if (midLine) {
          // This line already proved it isn't the SOURCES line.
          emit(controller, line);
          line = '';
          continue;
        }
        const trimmed = line.trimStart().toUpperCase();
        if (trimmed.length >= PREFIX.length && trimmed.startsWith(PREFIX)) {
          held = line.trimStart().slice(PREFIX.length);
          line = '';
        } else if (trimmed && !PREFIX.startsWith(trimmed)) {
          // Can't be the start of SOURCES:, so stream it now.
          emit(controller, line);
          line = '';
          midLine = true;
        }
      }
    },
    flush(controller) {
      if (held === null && line) emit(controller, line);
      const sources = parseSources(held ?? '', validSlugs);
      controller.enqueue(`\nSOURCES: ${sources.length ? sources.join(', ') : 'none'}`);
      onDone?.({ answer: answer.trim(), sources });
    },
  });
}

export function parseSources(text, validSlugs) {
  const valid = new Set(validSlugs);
  const seen = new Set();
  return String(text)
    .split(/[,\n]/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => valid.has(s) && !seen.has(s) && seen.add(s))
    .slice(0, 3);
}

// --- Sessions -------------------------------------------------------------
// A visitor passes the bot check once, then gets a signed session good for a
// short while, so every message doesn't need a new check.

const encoder = new TextEncoder();

function toBase64Url(bytes) {
  let binary = '';
  for (const b of new Uint8Array(bytes)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(data)));
}

export async function createSession(secret, ttlSeconds, now = Date.now()) {
  const payload = String(Math.floor(now / 1000) + ttlSeconds);
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function verifySession(secret, token, now = Date.now()) {
  if (typeof token !== 'string' || !token.includes('.')) return false;
  const [payload, signature] = token.split('.');
  if (!/^\d+$/.test(payload)) return false;
  if (Number(payload) < Math.floor(now / 1000)) return false;
  const expected = await hmac(secret, payload);
  // Constant-time comparison.
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

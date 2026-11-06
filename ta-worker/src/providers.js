// LLM providers. Each returns a stream of plain text, so the rest of the
// Worker doesn't care which model answered. Switch with the PROVIDER setting.

import { LIMITS } from './guard.js';

// Read a server-sent-events stream and pull text out of each event.
function sseToText(body, extract) {
  const decoder = new TextDecoder();
  let buffer = '';
  return body.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          let event;
          try {
            event = JSON.parse(data);
          } catch {
            continue;
          }
          const text = extract(event);
          if (text) controller.enqueue(text);
        }
      },
    }),
  );
}

// Anthropic (e.g. Claude Haiku 5.5). The instructions and lesson plans are
// marked for prompt caching, so repeat questions cost a fraction as much.
export async function streamAnthropic(env, { systemCached, systemVisitor, messages }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL,
      max_tokens: LIMITS.maxOutputTokens,
      stream: true,
      system: [
        { type: 'text', text: systemCached, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: systemVisitor },
      ],
      messages,
    }),
  });
  if (!res.ok || !res.body) throw new Error(`anthropic returned ${res.status}`);
  return sseToText(res.body, (e) => {
    if (e.type === 'error') throw new Error(`anthropic stream error: ${e.error?.type}`);
    return e.type === 'content_block_delta' && e.delta?.type === 'text_delta' ? e.delta.text : '';
  });
}

// Cloudflare Workers AI (open models, free daily allocation). Good for
// prototyping; check how well the chosen model stays in character.
export async function streamWorkersAI(env, { systemCached, systemVisitor, messages }) {
  const stream = await env.AI.run(env.WORKERS_AI_MODEL, {
    messages: [{ role: 'system', content: `${systemCached}\n\n${systemVisitor}` }, ...messages],
    max_tokens: LIMITS.maxOutputTokens,
    stream: true,
  });
  // Models differ: some send { response }, others OpenAI-style choices.
  return sseToText(stream, (e) => e.response ?? e.choices?.[0]?.delta?.content ?? '');
}

export function streamAnswer(env, prompt) {
  return env.PROVIDER === 'anthropic' ? streamAnthropic(env, prompt) : streamWorkersAI(env, prompt);
}

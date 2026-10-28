import { json, hit, blocked, lim } from "./_lib.js";
import { PROMPT } from "./_defaults.js";
import { cut } from "./_text.js";
import { answerStream } from "./_models.js";

const TXT = { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ error: "bad" }, 400); }
  const q = cut(b.q, 200);
  const src = (Array.isArray(b.sources) ? b.sources : []).slice(0, 8)
    .map(s => ({ title: cut(s.title, 120), content: cut(s.content, 300) })).filter(s => s.title || s.content);
  if (!q || !src.length) return json({ error: "bad" }, 400);
  if (blocked(q, env)) return json({ error: "blocked" });
  if (!(await hit(request, "a", lim(env, "a"), env))) return json({ error: "limit" });

  const ctx = src.map((s, i) => `[${i + 1}] ${s.title}: ${s.content}`).join("\n");
  const messages = [
    { role: "system", content: env.ANSWER_PROMPT || PROMPT },
    { role: "user", content: `Question: ${q}\n\nSearch results:\n${ctx}` }
  ];

  const r = await answerStream(messages, env);
  if (r.error) return json({ error: r.error });
  return new Response(r.body, { headers: TXT });
}

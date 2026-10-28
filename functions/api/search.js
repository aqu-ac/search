import { json, hit, blocked, lim } from "./_lib.js";
import { findResults } from "./_providers.js";

// Result cache keyed by a hash of the query only (never tied to a visitor), shared and short-lived.
async function ckey(q) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(q.toLowerCase().replace(/\s+/g, " ")));
  return new Request("https://aqu.ac/__q/" + [...new Uint8Array(h)].slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join(""));
}

export async function onRequestGet({ request, env }) {
  const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 200);
  if (!q) return json({ error: "empty" }, 400);
  if (blocked(q, env)) return json({ error: "blocked" }, 451);
  if (!(await hit(request, "s", lim(env, "s"), env))) return json({ error: "limit" }, 429);

  // Result caching is off by default (upstream terms restrict storing results). Set CACHE_TTL (seconds) to enable.
  const ttl = parseInt(env.CACHE_TTL || "0", 10) || 0;
  const ck = ttl > 0 ? await ckey(q) : null;
  if (ck) { const hitC = await caches.default.match(ck); if (hitC) return json(await hitC.json()); }

  const r = await findResults(q, env);
  const body = { results: r.results, source: r.live ? "web" : "fallback" };
  if (ck && r.live) await caches.default.put(ck, new Response(JSON.stringify(body), { headers: { "cache-control": "max-age=" + ttl } }));
  return json(env.DEBUG ? { ...body, why: r.why } : body);
}

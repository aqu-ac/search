import { BLOCK as DBLOCK, LIMITS as DLIMITS, SALT as DSALT } from "./_defaults.js";
export const JSONH = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };
export const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: JSONH });

async function sha(s) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].slice(0, 8).map(x => x.toString(16).padStart(2, "0")).join("");
}
// Soft per-visitor daily counter. The key is a salted hash that changes every day and lives only in
// Cloudflare's edge cache for 24h. Nothing is written to a database or log.
export async function hit(request, name, limit, env) {
  const ip = request.headers.get("cf-connecting-ip") || "0";
  const day = new Date().toISOString().slice(0, 10);
  const key = new Request(`https://aqu.ac/__rl/${name}/${day}/${await sha(ip + day + ((env && env.SALT) || DSALT))}`);
  const cache = caches.default;
  const cur = await cache.match(key);
  const n = cur ? parseInt(await cur.text(), 10) || 0 : 0;
  if (n >= limit) return false;
  await cache.put(key, new Response(String(n + 1), { headers: { "cache-control": "max-age=86400" } }));
  return true;
}

// Soft global daily counter (per Cloudflare location). Used to keep paid/limited upstream APIs under budget.
export async function globalHit(name, limit) {
  const day = new Date().toISOString().slice(0, 10);
  const key = new Request(`https://aqu.ac/__g/${name}/${day}`);
  const cache = caches.default;
  const cur = await cache.match(key);
  const n = cur ? parseInt(await cur.text(), 10) || 0 : 0;
  if (n >= limit) return false;
  await cache.put(key, new Response(String(n + 1), { headers: { "cache-control": "max-age=86400" } }));
  return true;
}

// Refuses a few clearly abusive categories before anything is sent upstream. Nothing is logged.
export function lim(env, k) {
  try { const o = JSON.parse((env && env.LIMITS) || "{}"); if (Number.isFinite(o[k])) return o[k]; } catch {}
  return DLIMITS[k];
}
let _re, _src;
export function blocked(q, env) {
  const raw = env && env.BLOCK_PATTERNS;
  if (_re === undefined || _src !== raw) {
    _src = raw;
    try { _re = raw ? JSON.parse(raw).map(s => new RegExp(s, "i")) : DBLOCK; } catch { _re = DBLOCK; }
  }
  return _re.some(r => r.test(q));
}

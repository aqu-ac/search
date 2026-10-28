// Site icon proxy: the visitor's browser only talks to Aqua; the icon is fetched server-side and cached.
const OK = /^(?=.{3,100}$)([a-z0-9-]+\.)+[a-z]{2,}$/;
export async function onRequestGet({ request }) {
  const d = (new URL(request.url).searchParams.get("d") || "").toLowerCase();
  if (!OK.test(d)) return new Response(null, { status: 400 });
  const key = new Request("https://aqu.ac/__icon/" + d);
  const hit = await caches.default.match(key);
  if (hit) return hit;
  let res;
  try {
    const r = await fetch(`https://icons.duckduckgo.com/ip3/${d}.ico`, { cf: { cacheTtl: 604800 } });
    const ct = r.headers.get("content-type") || "";
    if (r.ok && ct.startsWith("image/")) {
      res = new Response(r.body, { headers: { "content-type": ct, "cache-control": "public, max-age=604800", "x-content-type-options": "nosniff" } });
    }
  } catch {}
  if (!res) res = new Response(null, { status: 404, headers: { "cache-control": "public, max-age=86400" } });
  await caches.default.put(key, res.clone());
  return res;
}

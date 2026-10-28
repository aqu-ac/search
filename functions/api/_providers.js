// Generic provider routing shipped with the public source (the production router is private).
import { UA, clean, okUrl } from "./_text.js";

async function primary(q, env) {
  const r = await fetch(`${env.SEARCH_ENDPOINT}?q=${encodeURIComponent(q)}&count=20&safesearch=strict`,
    { headers: { accept: "application/json", "x-subscription-token": env.SEARCH_KEY } });
  if (!r.ok) throw new Error("upstream " + r.status);
  const d = await r.json();
  const seen = new Set();
  return (d.web?.results || []).filter(x => {
    if (!x.url || !okUrl(x.url)) return false;
    const h = new URL(x.url).hostname.replace(/^www\./, "");
    if (seen.has(h)) return false;
    seen.add(h); return true;
  }).slice(0, 10).map(x => ({ title: clean(x.title, 140), url: x.url, content: clean(x.description, 300), engine: "" }));
}

async function wiki(q) {
  const r = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&srlimit=10`, { headers: { "user-agent": UA } });
  const d = await r.json();
  return (d.query?.search || []).map(x => ({ title: clean(x.title, 140), url: "https://en.wikipedia.org/wiki/" + encodeURIComponent(x.title.replace(/ /g, "_")), content: clean(x.snippet, 300), engine: "" }));
}

export async function findResults(q, env) {
  if (env.SEARCH_KEY && env.SEARCH_ENDPOINT) { try { return { results: await primary(q, env), live: true, why: "" }; } catch {} }
  try { return { results: await wiki(q), live: false, why: "" }; } catch { return { results: [], live: false, why: "" }; }
}

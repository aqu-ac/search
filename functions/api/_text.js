export const UA = "Mozilla/5.0 (compatible; AquaSearch/0.1; +https://search.aqu.ac)";
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
export const unent = s => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] === "#") { try { return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)); } catch { return m; } }
  return ENT[e.toLowerCase()] ?? m;
});
export const clean = (s, n) => unent(String(s || "").replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim().slice(0, n);
export const cut = (s, n) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
export const okUrl = u => { try { const x = new URL(u); return x.protocol === "https:" || x.protocol === "http:"; } catch { return false; } };

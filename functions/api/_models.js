// Generic model routing shipped with the public source (the production router is private).
import { cut } from "./_text.js";

export async function answerStream(messages, env) {
  if (!env.AI) return { error: "unavailable" };
  try {
    const r = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fp8-fast", { messages, max_tokens: 260, temperature: 0.2 });
    const answer = cut(r.response, 1400);
    if (answer) return { body: answer };
  } catch { return { error: "limit" }; }
  return { error: "unavailable" };
}

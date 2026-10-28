# Aqua Search

A private search engine that answers without profiling you. Live at <https://search.aqu.ac>.

- Web results (from any compatible web-search API you configure) and a short AI answer with numbered sources are served by Cloudflare Pages Functions.
- No query logs, no accounts, no profiling. Rate limits use a salted daily hash that lives only in the edge cache.
- Icons are proxied so your browser never contacts a third party.

## Run it

Deploy the repository root as a Cloudflare Pages project (the `functions/` folder is picked up automatically) and set the
secrets listed in `.dev.vars.example`. The public source is a subset of the production service: provider and model routing, abuse patterns, the answer prompt and limits are private.
The generic defaults shipped here (`_defaults.js`, `_providers.js`, `_models.js`) are enough to run a basic instance; limits, abuse patterns, the prompt and the salt
can be overridden with the environment variables `LIMITS`, `BLOCK_PATTERNS`, `ANSWER_PROMPT` and `SALT`.

## License

Source-available under the Functional Source License (FSL-1.1-MIT): free to read, use, modify and self-host for
non-competing purposes; it converts to MIT two years after each release. Brand and visual assets are excluded, see `NOTICE-ASSETS.md`.
Security reports: see `SECURITY.md`.

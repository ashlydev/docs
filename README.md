# Docs-Based Support Bot for Scheduling SaaS

A focused support-bot pilot for scheduling and booking SaaS companies. The app answers questions from an ingested knowledge base, cites its sources, falls back safely when evidence is weak, escalates risky or account-specific requests, and logs simple analytics.

## Who it is for

- Founders and product teams at scheduling SaaS companies
- Heads of support who want to reduce repetitive public-doc questions
- Agencies or operators showing a support-bot pilot before a broader rollout

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres + pgvector for storage and retrieval
- Ollama for free local development and testing
- Gemini API for hosted/public demos

## What changed

This version is intentionally optimized for a cheaper and more stable hosted demo:

- local development mode stays on Ollama
- hosted production mode is now Gemini API
- default demo ingestion uses repo-local static docs instead of live third-party scraping

That removes the two major hosted-demo blockers from the earlier plan:

- OpenAI billing and quota dependence
- unstable third-party doc ingestion paths that can fail on 403s or layout changes

## Provider Modes

### Ollama local mode

Use this for free local development and testing.

- `LLM_PROVIDER=ollama`
- `OLLAMA_BASE_URL=http://localhost:11434`
- `OLLAMA_CHAT_MODEL=gemma3:1b`
- `OLLAMA_EMBEDDING_MODEL=embeddinggemma`

### Gemini hosted mode

Use this for hosted/public demos.

- `LLM_PROVIDER=gemini`
- `GEMINI_API_KEY=...`
- `GEMINI_CHAT_MODEL=gemini-2.5-flash-lite`
- `GEMINI_EMBEDDING_MODEL=gemini-embedding-001`

## Recommended Setup

### Local development

- `LLM_PROVIDER=ollama`
- `OLLAMA_BASE_URL=http://localhost:11434`
- `OLLAMA_CHAT_MODEL=gemma3:1b`
- `OLLAMA_EMBEDDING_MODEL=embeddinggemma`

### Public hosted demo

- `LLM_PROVIDER=gemini`
- `GEMINI_CHAT_MODEL=gemini-2.5-flash-lite`
- `GEMINI_EMBEDDING_MODEL=gemini-embedding-001`

## Why the hosted demo uses local static docs by default

The hosted demo no longer depends on scraping Calendly or other third-party help centers by default.

Reasons:

- third-party sites can block server-side fetches
- public pages can change layout without notice
- hosted demos need a stable and controllable knowledge base
- local docs make citations, support boundaries, and fallback behavior easier to verify

External URL ingestion still exists as an optional mode, but it is no longer the default hosted path.

## Demo knowledge base

The default hosted demo uses bundled internal docs defined in `lib/demo-kb.ts`.

The bundled knowledge base includes:

- `pricing`
- `plans`
- `billing`
- `invoices`
- `cancellations`
- `support`
- `escalation`

These documents represent a polished fictional support center for a scheduling SaaS. During ingestion, they are normalized in memory and stored with internal source identifiers such as:

- `internal://demo-kb/pricing`
- `internal://demo-kb/billing`
- `internal://demo-kb/support`

Those internal identifiers are preserved in citations so the demo can still show grounded support references without depending on external URLs.

Hosted `demo-local` ingestion no longer reads markdown files from the runtime filesystem. That avoids `ENOENT` failures in Vercel serverless deployments where `demo-kb/*.md` may not be available at runtime.

## Environment Variables

Copy `./.env.example` to `.env.local` and configure:

### General

- `LLM_PROVIDER=ollama|gemini`
- `NEXT_PUBLIC_APP_URL`
- `SUPPORT_LINK`
- `NEXT_PUBLIC_SUPPORT_LINK`
- `NEXT_PUBLIC_TEARDOWN_LINK`
- `INGESTION_SECRET`

### Supabase

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Ollama

- `OLLAMA_BASE_URL`
- `OLLAMA_CHAT_MODEL`
- `OLLAMA_EMBEDDING_MODEL`

### Gemini

- `GEMINI_API_KEY`
- `GEMINI_CHAT_MODEL`
- `GEMINI_EMBEDDING_MODEL`

Notes:

- Gemini variables are not required when `LLM_PROVIDER=ollama`.
- Ollama variables are not required when `LLM_PROVIDER=gemini`.
- Hosted deployments must not leave `OLLAMA_BASE_URL` pointed at `localhost` or another loopback-only address.
- Secrets stay server-only. Do not expose `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in client bundles.

## How ingestion works

1. `npm run ingest` or `POST /api/ingest` selects a source set.
2. If no custom URLs are passed, the app ingests the repo-local `demo-local` source set.
3. Bundled internal docs are normalized in memory, chunked, embedded, and stored in Supabase.
4. External URL ingestion remains optional and uses the same pipeline when you explicitly pass custom URLs or select the external source set.
5. Per-source ingestion failures are isolated and returned in the results instead of crashing the whole batch when avoidable.

### Default local demo ingestion

```bash
npm run ingest
```

### Force re-ingestion of local demo docs

```bash
npm run ingest -- --force
```

### Select the default demo source set explicitly

```bash
npm run ingest -- --source-set demo-local --force
```

### Optional external URL ingestion

```bash
npm run ingest -- --source-set calendly-public-docs --force
```

### Optional API ingestion request

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INGESTION_SECRET" \
  -d '{"sourceSet":"demo-local","force":true}'
```

## How retrieval works

1. The question is embedded with the active embedding provider.
2. Supabase RPC `match_document_chunks` performs pgvector cosine similarity search.
3. Retrieval is filtered to chunks embedded by the currently configured provider and embedding model.
4. The app scores retrieval strength with a lightweight heuristic.
5. If the evidence is strong enough, the retrieved chunks are passed to the chat model for a grounded answer with citations.

## How fallback works

Fallback triggers when:

- retrieval is too weak
- the active model cannot produce a well-supported answer with citations
- the user asks for an account action such as cancellation, refunds, or billing changes on their behalf
- the question falls outside ingested documentation
- the configured provider is unavailable or misconfigured

The bot never claims to:

- access private customer accounts
- update billing details
- cancel subscriptions
- process refunds
- read private customer data

## How citations work now

Supported answers still include citations. For the default hosted demo, those citations point to the repo-local demo knowledge base, for example:

- `Pricing & Plans`
- `Plans for Teams`
- `Billing & Invoices`
- `Contacting Support`

The citation URL is an internal source reference like `internal://demo-kb/pricing`.

## Re-ingestion when providers change

When you change embedding providers or embedding models, re-ingest the knowledge base before testing again.

Why:

- Ollama and Gemini embeddings should not be mixed in the same active retrieval flow.
- The app records the embedding provider and model in chunk metadata and only retrieves from matching vectors.
- If you switch providers or switch embedding models, old chunks will not match the new embedding configuration safely.

Recommended command after any embedding change:

```bash
npm run ingest -- --force
```

## Supabase Migrations

This repo includes Supabase CLI project files plus a baseline migration created from `supabase/schema.sql`.

- `supabase/config.toml`
- `supabase/migrations/20260315081147_initial_schema.sql`
- `supabase/schema.sql`

The Supabase CLI is installed as a dev dependency, so `npx supabase ...` uses the repo version.

### Link this repo to your Supabase project

1. Log in to Supabase CLI:

```bash
npx supabase login
```

2. Link the repo to your remote project:

```bash
npx supabase link --project-ref your-project-ref
```

`supabase link` will prompt for the remote database password.

### Check migration state

```bash
npx supabase migration list
```

### Push migrations to the remote database

Review what will be applied first:

```bash
npx supabase db push --dry-run
```

Then apply the migration:

```bash
npx supabase db push
```

Production-safe note:

- If the remote database already contains tables created manually in the SQL editor, do not push the baseline migration blindly.
- Reconcile the remote schema first before applying new migrations.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env vars:

```bash
cp .env.example .env.local
```

3. Fill in:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INGESTION_SECRET`

4. Choose local Ollama mode:

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=gemma3:1b
OLLAMA_EMBEDDING_MODEL=embeddinggemma
```

5. Pull and start Ollama models:

```bash
ollama pull gemma3:1b
ollama pull embeddinggemma
ollama serve
```

6. Ingest the local demo docs:

```bash
npm run ingest
```

7. Start the app:

```bash
npm run dev
```

## Hosted Deployment Steps

For public hosting, the recommended mode is Gemini.

1. Set `LLM_PROVIDER=gemini`
2. Set `GEMINI_API_KEY`
3. Set `GEMINI_CHAT_MODEL=gemini-2.5-flash-lite`
4. Set `GEMINI_EMBEDDING_MODEL=gemini-embedding-001`
5. Set `SUPABASE_URL`
6. Set `SUPABASE_SERVICE_ROLE_KEY`
7. Set `INGESTION_SECRET`
8. Set your public support and teardown links
9. Deploy the Next.js app
10. Run the default `demo-local` ingestion after deploy

Hosted deployment notes:

- The hosted path no longer requires OpenAI billing.
- The hosted path no longer depends on third-party doc scraping by default.
- If `LLM_PROVIDER=ollama` in a hosted deployment, `OLLAMA_BASE_URL` must point to a reachable non-local host.
- `GET /api/health` should report `provider="gemini"` and a ready knowledge base after successful ingestion.

## Verification Results

Verification run date:

- March 15, 2026

Commands run:

- `npm run typecheck` - passed
  - `next typegen` generated route types successfully
  - `tsc --noEmit` completed successfully
- `npm run lint` - passed
- `npm run build` - passed
- `curl -sS --max-time 5 http://localhost:11434/api/tags` - passed and confirmed local Ollama models are reachable for local-mode verification
- `node --import tsx -e "<load demo-local source and call extractReadableContent>"` - passed and returned bundled `internal://demo-kb/pricing` content without any filesystem read

What was fixed:

- replaced runtime `fs.readFile()` access for `demo-local` ingestion with bundled in-code docs in `lib/demo-kb.ts`
- changed the default `demo-local` source set from filesystem-backed files to bundled inline documents
- removed the now-unused demo-local filesystem/path dependency from `lib/content-extractor.ts`
- preserved the same internal citation URLs such as `internal://demo-kb/pricing` and `internal://demo-kb/support`
- kept optional external URL ingestion available
- preserved retrieval, citations, fallback, escalation, and analytics

What still needs manual verification:

- a live hosted redeploy on Vercel using this updated build
- one real `demo-local` ingestion pass against the hosted environment and your Supabase project
- live Gemini API calls with a real `GEMINI_API_KEY`
- end-to-end grounded answers after the knowledge base is ingested into your actual Supabase project

Final readiness judgment:

Approved for code verification: `npm run typecheck`, `npm run lint`, and `npm run build` all passed in this workspace on March 15, 2026. The default hosted `demo-local` ingestion path no longer depends on runtime markdown files, so the prior Vercel `ENOENT` failure mode is removed from the implementation. A live hosted ingest still needs one post-deploy verification pass with your real environment.

## Manual Final Checks Before Deploying

- verify `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `INGESTION_SECRET`, and `GEMINI_API_KEY`
- set `LLM_PROVIDER=gemini` in the hosted environment
- run `npm run ingest -- --source-set demo-local --force`
- test supported questions about pricing, billing, invoices, plans, and support contact
- test unsafe questions about cancellations, refunds, billing changes, and account access
- verify that supported answers include citations from the local demo docs
- verify that unsupported or risky prompts fall back cleanly
- verify that escalation still routes to your support CTA
- verify the review and teardown CTA links
- verify the mobile chat composer and message layout

## Scope boundaries

- public knowledge only
- no auth
- no billing mutations
- no account actions
- no multi-tenancy
- no private account access

This is a focused pilot asset for selling a docs-based support bot engagement, not a full support platform.

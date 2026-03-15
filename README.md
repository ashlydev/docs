# Docs-Based Support Bot for Scheduling SaaS

A focused support-bot pilot for scheduling and booking SaaS companies. The app answers questions from ingested public docs, cites its sources, falls back safely when evidence is weak, escalates risky or account-specific requests, and logs simple analytics.

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
- OpenAI for hosted/public deployments

## What the app does

- Ingests public pricing, help center, billing, and support/contact pages
- Chunks and embeds those pages into Supabase pgvector
- Retrieves the most relevant chunks for each question
- Generates concise answers only from retrieved context
- Shows linked source citations for supported answers
- Falls back when retrieval is weak or the answer is not confidently supported
- Escalates risky or account-specific requests to human support
- Logs chat outcomes for a simple analytics summary

## Provider Modes

The app supports two provider modes through `LLM_PROVIDER`.

### Ollama local mode

Use this for free local development and testing.

- `LLM_PROVIDER=ollama`
- `OLLAMA_BASE_URL=http://localhost:11434`
- `OLLAMA_CHAT_MODEL=gemma3:1b`
- `OLLAMA_EMBEDDING_MODEL=embeddinggemma`

### OpenAI hosted mode

Use this for public hosting.

- `LLM_PROVIDER=openai`
- `OPENAI_API_KEY=...`
- `OPENAI_CHAT_MODEL=gpt-4.1-nano`
- `OPENAI_EMBEDDING_MODEL=text-embedding-3-small`

## Recommended Setup

### Local development

- `LLM_PROVIDER=ollama`
- `OLLAMA_BASE_URL=http://localhost:11434`
- `OLLAMA_CHAT_MODEL=gemma3:1b`
- `OLLAMA_EMBEDDING_MODEL=embeddinggemma`

### Public hosted demo

- `LLM_PROVIDER=openai`
- `OPENAI_CHAT_MODEL=gpt-4.1-nano`
- `OPENAI_EMBEDDING_MODEL=text-embedding-3-small`

## Environment Variables

Copy `./.env.example` to `.env.local` and configure:

### General

- `LLM_PROVIDER=ollama|openai`
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

### OpenAI

- `OPENAI_API_KEY`
- `OPENAI_CHAT_MODEL`
- `OPENAI_EMBEDDING_MODEL`

Notes:

- OpenAI variables are not required when `LLM_PROVIDER=ollama`.
- Ollama variables are not required when `LLM_PROVIDER=openai`.
- Keep `SUPPORT_LINK` and `NEXT_PUBLIC_SUPPORT_LINK` aligned so server responses and client UI use the same handoff target.
- Hosted deployments must not leave `OLLAMA_BASE_URL` pointed at `localhost` or another loopback-only address.

## Ollama Requirements

If you are using local mode, install the required models and run Ollama:

```bash
ollama pull gemma3:1b
ollama pull embeddinggemma
ollama serve
```

Default local Ollama base URL:

```text
http://localhost:11434
```

## How Ingestion Works

1. `scripts/seed-demo.ts` or `POST /api/ingest` takes a list of public URLs.
2. The ingestion pipeline fetches each page, strips obvious layout noise, and extracts readable text.
3. The text is chunked into overlapping sections.
4. Each chunk is embedded through the active provider.
5. Chunks are stored in `document_chunks` with source metadata and vector embeddings.

Starter source sets live in `lib/demo-sources.ts` so you can swap the pilot company later without changing the rest of the app.

## How Retrieval Works

1. The question is embedded with the active embedding provider.
2. Supabase RPC `match_document_chunks` performs pgvector cosine similarity search.
3. Retrieval is filtered to chunks embedded by the currently configured provider/model.
4. The app scores retrieval strength with a lightweight heuristic.
5. If the evidence is strong enough, the retrieved chunks are passed to the chat model for a grounded answer with citations.

## How Fallback Works

Fallback triggers when:

- Retrieval is too weak
- The active model cannot produce a well-supported answer with citations
- The user asks for an account action such as cancellation, refunds, or billing changes on their behalf
- The question falls outside ingested documentation
- The configured provider is unavailable

The bot never claims to:

- access private customer accounts
- update billing details
- cancel subscriptions
- process refunds
- read private customer data

## Important Re-ingestion Note

When you change embedding providers or embedding models, re-ingest the docs before testing the bot.

Why:

- Ollama and OpenAI embeddings should not be mixed in the same active retrieval flow.
- The app records the embedding provider and model in chunk metadata and only retrieves from matching vectors.
- If you switch from Ollama to OpenAI, or change embedding models within either provider, old chunks will not match the new embedding configuration safely.

Recommended command after any embedding change:

```bash
npm run ingest -- --force
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env vars:

```bash
cp .env.example .env.local
```

3. Create a Supabase project, then use the migration workflow below to link this repo and push the baseline schema.

4. Pick your provider mode:

For Ollama local mode:

```bash
ollama pull gemma3:1b
ollama pull embeddinggemma
ollama serve
```

For OpenAI local verification:

- Set `LLM_PROVIDER=openai`
- Set `OPENAI_API_KEY`

5. Seed the docs:

```bash
npm run ingest
```

Optional reseed commands:

```bash
npm run ingest -- --force
npm run ingest -- --url https://example.com/pricing --url https://example.com/help
```

6. Start the app:

```bash
npm run dev
```

Optional verification helpers:

```bash
npm run typecheck
npm run lint
npm run build
npm run smoke
```

If your app is not running on port `3000`, point the smoke script at the correct URL:

```bash
APP_BASE_URL=http://localhost:3001 npm run smoke
```

## Supabase Migrations

This repo now includes Supabase CLI project files plus a baseline migration created from `supabase/schema.sql`.

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

`supabase link` will prompt for the database password of the remote project.

### Check migration state

```bash
npx supabase migration list
```

Run this after linking so you can compare local migrations with the remote migration history.

### Push migrations to the remote database

For a fresh remote project, review the plan first:

```bash
npx supabase db push --dry-run
```

Then apply the migration:

```bash
npx supabase db push
```

Production-safe note:

- If the remote database already contains tables created manually in the SQL editor, do not push the baseline migration blindly.
- In that case, reconcile the remote state first before applying new migrations.

### What you still need to do in the Supabase dashboard

- Create the Supabase project if you have not created it yet.
- Save the database password you choose during project creation because the CLI will ask for it when linking or pushing.
- Copy the project ref from the project URL or project settings so you can run `npx supabase link --project-ref your-project-ref`.
- Copy the project API URL into `SUPABASE_URL` in `.env.local`.
- Copy the service role key into `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
- If you already ran `supabase/schema.sql` manually in the remote SQL editor, stop before `db push` and reconcile that database first instead of applying the baseline migration a second time.
- You do not need to enable `vector` or `pgcrypto` manually in the dashboard because the migration creates those extensions.

## Production Hosting

For public hosting, the recommended mode is OpenAI.

### Vercel or similar hosting with OpenAI

1. Set `LLM_PROVIDER=openai`
2. Set `OPENAI_API_KEY`
3. Set `OPENAI_CHAT_MODEL=gpt-4.1-nano`
4. Set `OPENAI_EMBEDDING_MODEL=text-embedding-3-small`
5. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
6. Set your public support and teardown links
7. Deploy the Next.js app
8. Run ingestion locally or call the protected `/api/ingest` route after deploy

### Hosted Ollama mode

This is supported, but only if `OLLAMA_BASE_URL` points to a reachable Ollama host.

1. Host Ollama on a reachable VM, container, or private network service
2. Pull `gemma3:1b` and `embeddinggemma` on that Ollama host
3. Set `LLM_PROVIDER=ollama`
4. Set `OLLAMA_BASE_URL` to the reachable Ollama URL
5. Set Supabase env vars
6. Deploy the app

Hosted deployment notes:

- Vercel env vars are managed in the Vercel project settings or via the Vercel CLI, not in the repository.
- After changing env vars in Vercel, redeploy so the runtime picks them up.
- Use `GET /api/health` after deploy to confirm provider status and Supabase status.
- A hosted deployment is not ready if `LLM_PROVIDER=ollama` and `OLLAMA_BASE_URL` still points to `localhost`, `127.0.0.1`, or another loopback-only host.

Example ingestion request:

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INGESTION_SECRET" \
  -d '{"sourceSetKey":"calendly-public-docs","force":true}'
```

## What to Customize Before Showing Prospects

- Replace the source set in `lib/demo-sources.ts`
- Update positioning and CTA copy in `lib/site-config.ts`
- Change support handoff links in `.env.local`
- Tune retrieval thresholds in `lib/retrieval.ts`
- Adjust answer instructions in `lib/prompts.ts`
- Re-seed the knowledge base with the public docs you want prospects to see

## Notes on pgvector Dimensions

This version uses an unbounded `vector` column in `supabase/schema.sql` so different embedding models can be swapped without hardcoding a single dimension. If you later standardize on one embedding size and need a larger indexed corpus, add an approximate index for that fixed dimension.

## Important Scope Boundaries

- Public docs only
- No auth
- No billing mutations
- No account actions
- No multi-tenancy
- No private account access

This is a focused pilot asset for selling a docs-based support bot engagement, not a full support platform.

## Verification Results

Commands run:

- `npm install openai` - passed
- `npm run typecheck` - passed
- `npm run lint` - passed
- `npm run build` - passed
- `npm run smoke` - failed in this sandbox because Node could not connect to the local app server at `127.0.0.1:3000` (`EPERM`); rerun against a live local server with `APP_BASE_URL=http://localhost:3000 npm run smoke` or your actual port
- `npm run ingest` - failed in this workspace because `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are not configured
- `curl -sS --max-time 5 http://localhost:11434/api/tags` - passed and confirmed local Ollama is up with `gemma3:1b` and `embeddinggemma`
- Direct backend provider smoke checks through `node --import tsx` - passed for provider-aware fallback and unsafe-request refusal behavior

What was fixed:

- Added a clean provider abstraction for Ollama and OpenAI
- Added OpenAI chat generation and embedding support
- Made env parsing strict but provider-aware
- Updated ingestion and retrieval to use the active provider
- Stored embedding provider/model metadata on chunks and filtered retrieval to matching vectors
- Fixed re-ingestion behavior so unchanged docs are still re-embedded after provider/model switches
- Kept fallback, escalation, citations, and analytics flows intact
- Preserved the chat composer and buyer-facing UI structure

What was verified successfully:

- The app now supports both `LLM_PROVIDER=ollama` and `LLM_PROVIDER=openai`
- TypeScript, lint, and production build all pass
- OpenAI mode does not require Ollama configuration
- Ollama mode does not require OpenAI configuration
- Unsafe prompts still return `refused` with escalation in both modes
- Missing provider configuration now returns a clean provider-aware fallback instead of a crash
- Local Ollama models are present in this environment

What still needs manual verification:

- Grounded answers with citations after Supabase is configured and docs are ingested
- End-to-end ingestion into Supabase in both provider modes
- Full `npm run smoke` execution against a running local or hosted app URL
- Hosted OpenAI mode with real credentials
- Hosted Ollama mode with a reachable non-local `OLLAMA_BASE_URL`
- Final visual QA on mobile and desktop

Whether Ollama local mode was verified:

- Partially verified

Details:

- Ollama models were confirmed via `curl`
- The Ollama code path builds and reports provider-specific health state
- Full Ollama end-to-end answering was blocked here because this workspace has no Supabase config and sandboxed Node fetch could not reach local Ollama even though `curl` could

Whether OpenAI hosted mode was verified:

- Partially verified

Details:

- The OpenAI provider compiles and is fully wired into the runtime
- OpenAI mode reports clean configuration status and provider-aware fallback behavior
- Live OpenAI API calls were not verified here because no `OPENAI_API_KEY` was configured in this workspace

External blockers encountered here:

- This workspace does not have `.env.local`, so Supabase-backed ingestion and grounded retrieval could not be completed
- Live OpenAI verification was blocked by missing credentials
- `npm run smoke` could not reach a local app server from Node fetch in this sandbox (`EPERM 127.0.0.1:3000`)
- Sandboxed Node networking blocked local Ollama fetches from the app code path even though direct `curl` to Ollama succeeded

Final readiness judgment:

- `Host-near`

Reason:

- The provider split is in place, build-clean, and deployment-guided, but it is not honestly `Host-ready` until Supabase is configured, docs are ingested with the intended embedding provider, and hosted OpenAI mode is verified with real credentials in a real deployment environment.

## Manual Final Checks Before Deploying

- Verify env vars for the intended provider mode
- Verify `LLM_PROVIDER` is set correctly
- If using Ollama in production, verify `OLLAMA_BASE_URL` is reachable and not local-only
- If using OpenAI, verify `OPENAI_API_KEY` is set
- Run ingestion after choosing the final embedding provider
- Test supported questions about pricing, billing, support contact, and plan fit
- Test unsafe questions about refunds, cancellations, billing changes, and account access
- Verify grounded answers include citations
- Verify weak or unsupported questions fall back cleanly
- Verify escalation links point to the correct support destination
- Verify CTA links before outreach
- Verify the mobile chat composer and send button

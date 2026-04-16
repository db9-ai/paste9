# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Paste9

Ephemeral markdown pastebin for AI agents. All pastes live in a single shared PostgreSQL database (db9). Pastes auto-expire via pg_cron. No accounts, no persistent state from the user's perspective.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build + TypeScript checks
npm run lint     # ESLint
```

## Architecture

```
POST /api/paste {content}    → INSERT into pastes table, chunk + embed for search → return {url, id}
GET /p/{id}                  → SELECT from pastes WHERE id AND not expired → text/markdown
GET /p/{id}?q=query&limit=N → vector search in chunks table → relevant sections only
```

**Single shared db9 database.** Paste IDs are nanoid(10). Content stored in `pastes` table, chunks in `chunks` table with vector embeddings. pg_cron deletes expired pastes every hour.

Key files:
- `src/lib/db9.ts` — all database interaction: create/read paste, chunking, vector search
- `src/lib/rate-limit.ts` — in-memory IP rate limiting (100 req/min)
- `src/app/api/paste/route.ts` — POST endpoint
- `src/app/p/[token]/route.ts` — GET endpoint (read + search)
- `src/app/page.tsx` — home page
- `src/app/demo.tsx` — interactive demo
- `src/app/docs/page.tsx` — API docs
- `src/app/shell.tsx` — shared Header/Footer
- `src/app/components.tsx` — shared CopyButton
- `public/skill.md` — API docs for agents (static file)

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (db9)

## Resources

- db9 skill: `Read https://db9.ai/skill.md and follow instructions`

## Conventions

- Brand name is **Paste9** (capital P)
- Only markdown content
- `/p/{id}` returns raw markdown directly (no rendered HTML view)
- Dark monochrome UI: background `#0a0a0a`, foreground `#ededed`
- Default paste TTL: 300 minutes (5 hours)
- Rate limit: 100 req/min per IP

## Semantic Search

Long pastes (>100 chars) are automatically chunked via langchain `RecursiveCharacterTextSplitter` and embedded using db9's built-in `embedding` extension. Chunks stored in `chunks` table with vector column. `?q=` uses `vec <=> embedding(query)` for similarity search. If embedding fails, paste creation still succeeds and `?q=` falls back to full document.

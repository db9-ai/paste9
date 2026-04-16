# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Paste9

Ephemeral markdown pastebin for AI agents. Each paste creates an anonymous db9 database instance, stores content as `/paste.md` in its filesystem. When db9 reclaims the anonymous database, the paste disappears. No accounts, no cleanup logic, no persistent state.

## Commands

```bash
npm run dev      # Start dev server (usually port 3001 if 3000 is taken)
npm run build    # Production build — also runs TypeScript checks
npm run lint     # ESLint
```

## Architecture

```
POST /api/paste {content} → createPaste() → db9 anonymous db + fs.write("/paste.md")
                           → encodeToken(dbId:password as base64url) → return {url, token}

GET /p/{token}             → decodeToken() → db9 fs.read("/paste.md") → text/markdown response
GET /p/{token}?q=query     → decodeToken() → db9 SQL vec_embed_cosine_distance → relevant chunks
```

### Semantic Search

Long pastes (>500 chars) are automatically chunked via langchain `RecursiveCharacterTextSplitter` and indexed using db9's built-in `embedding` extension. Each chunk is stored in a `chunks` table within the paste's own anonymous database. `?q=` uses `vec_embed_cosine_distance()` to return relevant sections. If embedding setup fails, paste creation still succeeds and `?q=` falls back to the full document.

**One paste = one anonymous db9 instance.** The token in the URL is `dbId:password` base64url-encoded. The password is needed for the SDK client to authenticate, but `readPaste()` currently only uses the dbId (the shared SDK client has its own auth).

Key files:
- `src/lib/db9.ts` — all db9 interaction: create/read paste, token encode/decode
- `src/app/api/paste/route.ts` — POST endpoint, returns absolute URL using `req.nextUrl.origin`
- `src/app/p/[token]/route.ts` — GET endpoint, returns raw `text/markdown`
- `src/app/page.tsx` — client component, home page with editor
- `public/skill.md` — API docs for agents (served as static file)

## Resources

- db9 SDK: `get-db9` npm package — `createDb9Client()`, `client.databases.create()`, `client.fs.write/read()`
- db9 skill: `Read https://db9.ai/skill.md and follow instructions`

## Conventions

- Brand name is **Paste9** (capital P)
- Only markdown content — no language selector, no multi-format
- `/p/{token}` returns raw markdown directly (no rendered HTML view)
- Dark monochrome UI: background `#0a0a0a`, foreground `#ededed`, borders `#1a1a1a`/`#2d2d2d`
- `origin` is derived at runtime to work across any deployment domain — use `suppressHydrationWarning` on elements that depend on it

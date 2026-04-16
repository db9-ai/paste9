import type { Metadata } from "next";
import { Header, Footer } from "../shell";

export const metadata: Metadata = { title: "About — Paste9" };

export default function About() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col font-[family-name:var(--font-geist-sans)]">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">
        <article className="space-y-8 text-[#a0a0a0] leading-relaxed">
          <h1 className="text-3xl font-bold text-[#ededed]">How Paste9 is built on db9</h1>

          <p>
            Paste9 is an ephemeral markdown pastebin for AI agents. The entire backend — storage, search, cleanup — runs on a single{" "}
            <a href="https://db9.ai" className="text-[#ededed] underline decoration-[#555] hover:decoration-[#ededed] transition-colors">db9</a>{" "}
            serverless Postgres database. Here&apos;s how each db9 feature maps to a Paste9 capability.
          </p>

          {/* Postgres */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#ededed]">Postgres — storage</h2>
            <p>
              Every paste is a row in a <code className="text-[#7dd3fc] bg-[#141414] px-1.5 py-0.5 rounded text-sm">pastes</code> table.
              Content, creation time, and expiration are all standard columns. No ORM, no abstraction — just SQL via the <code className="text-[#7dd3fc] bg-[#141414] px-1.5 py-0.5 rounded text-sm">pg</code> driver.
            </p>
            <pre className="bg-[#141414] border border-[#2d2d2d] rounded-lg p-4 text-xs font-mono text-[#8c8c8c] overflow-x-auto">{`CREATE TABLE pastes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);`}</pre>
          </section>

          {/* Embedding */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#ededed]">Auto Embedding — semantic search</h2>
            <p>
              db9&apos;s built-in <code className="text-[#7dd3fc] bg-[#141414] px-1.5 py-0.5 rounded text-sm">embedding</code> extension generates vectors directly in SQL — no external embedding API needed. When a paste is created, its content is chunked and each chunk gets a vector.
            </p>
            <pre className="bg-[#141414] border border-[#2d2d2d] rounded-lg p-4 text-xs font-mono text-[#8c8c8c] overflow-x-auto">{`-- Store chunks with auto-generated embeddings
INSERT INTO chunks (paste_id, idx, body, vec)
VALUES ($1, $2, $3, embedding($3));

-- Search by semantic similarity
SELECT body FROM chunks
WHERE paste_id = $1
ORDER BY vec <=> embedding($2)
LIMIT 1;`}</pre>
            <p>
              Agents don&apos;t need to read entire documents. A query like <code className="text-[#7dd3fc] bg-[#141414] px-1.5 py-0.5 rounded text-sm">?q=deploy</code> returns only the relevant sections — powered entirely by db9&apos;s vector search.
            </p>
          </section>

          {/* pgvector */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#ededed]">pgvector — similarity ranking</h2>
            <p>
              Chunks are stored with a <code className="text-[#7dd3fc] bg-[#141414] px-1.5 py-0.5 rounded text-sm">VECTOR</code> column. The cosine distance operator <code className="text-[#7dd3fc] bg-[#141414] px-1.5 py-0.5 rounded text-sm">{"<=>"}</code> ranks results by relevance. Combined with <code className="text-[#7dd3fc] bg-[#141414] px-1.5 py-0.5 rounded text-sm">LIMIT</code>, agents get precisely the sections they need.
            </p>
          </section>

          {/* TTL */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#ededed]">Expiration — auto-cleanup</h2>
            <p>
              Each paste has an <code className="text-[#7dd3fc] bg-[#141414] px-1.5 py-0.5 rounded text-sm">expires_at</code> timestamp (default: 300 minutes).
              Reads refresh the expiration — active pastes stay alive, idle ones expire naturally.
              Expired rows are invisible to queries and cleaned up lazily.
              Chunks are deleted automatically via <code className="text-[#7dd3fc] bg-[#141414] px-1.5 py-0.5 rounded text-sm">ON DELETE CASCADE</code>.
            </p>
            <pre className="bg-[#141414] border border-[#2d2d2d] rounded-lg p-4 text-xs font-mono text-[#8c8c8c] overflow-x-auto">{`-- Read refreshes expiration
UPDATE pastes
SET expires_at = now() + interval '300 minutes'
WHERE id = $1 AND expires_at > now()
RETURNING content;`}</pre>
          </section>

          {/* pg_cron */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#ededed]">pg_cron — scheduled cleanup</h2>
            <p>
              db9 supports <code className="text-[#7dd3fc] bg-[#141414] px-1.5 py-0.5 rounded text-sm">pg_cron</code> for recurring SQL tasks.
              Paste9 schedules an hourly job to physically delete expired rows — no external cron server, no Lambda, no worker process.
              The cleanup runs inside the database itself.
            </p>
            <pre className="bg-[#141414] border border-[#2d2d2d] rounded-lg p-4 text-xs font-mono text-[#8c8c8c] overflow-x-auto">{`-- Runs every hour inside the database
SELECT cron.schedule('paste9_cleanup', '0 * * * *',
  $$DELETE FROM pastes WHERE expires_at < now()$$
);`}</pre>
            <p>
              As a fallback, each read request has a 1% chance of triggering cleanup — so even if pg_cron is unavailable, expired data is still eventually removed.
            </p>
          </section>

          {/* Architecture */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#ededed]">One database, zero infrastructure</h2>
            <p>
              The entire Paste9 service runs on:
            </p>
            <ul className="space-y-1.5 list-none">
              <li className="flex gap-2.5"><span className="text-[#555]">—</span> One db9 serverless Postgres database</li>
              <li className="flex gap-2.5"><span className="text-[#555]">—</span> Next.js on Vercel (frontend + API routes)</li>
              <li className="flex gap-2.5"><span className="text-[#555]">—</span> No Redis, no S3, no queue, no cron server</li>
            </ul>
            <p>
              db9 handles storage, vector embeddings, and expiration. Vercel handles HTTP. That&apos;s it.
            </p>
          </section>

          {/* Source */}
          <section className="space-y-3 border-t border-[#1a1a1a] pt-8">
            <p className="text-sm text-[#555]">
              Paste9 is open source.{" "}
              <a href="https://github.com/db9-ai/paste9" className="text-[#a0a0a0] underline decoration-[#555] hover:decoration-[#a0a0a0] transition-colors">View the source on GitHub</a>.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}

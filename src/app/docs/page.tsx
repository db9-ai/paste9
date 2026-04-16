import type { Metadata } from "next";
import { Header, Footer } from "../shell";
import { CopyButton } from "../components";

export const metadata: Metadata = { title: "Docs — Paste9" };

function Code({ code, children }: { code: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      <pre className="bg-[#0a0a0a] border border-[#2d2d2d] rounded p-3 pr-10 text-xs font-mono overflow-x-auto">{children}</pre>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} />
      </div>
    </div>
  );
}

export default function Docs() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col font-[family-name:var(--font-geist-sans)]">
      <Header />

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-6">
        <aside className="hidden lg:block w-44 shrink-0 py-12 pr-8">
          <nav className="sticky top-8 space-y-1">
            <div className="text-xs font-mono text-[#555] uppercase tracking-wider mb-3">API</div>
            <a href="#create" className="block text-sm font-mono text-[#737373] hover:text-[#ededed] transition-colors py-1">Create</a>
            <a href="#read" className="block text-sm font-mono text-[#737373] hover:text-[#ededed] transition-colors py-1">Read</a>
            <a href="#search" className="block text-sm font-mono text-[#737373] hover:text-[#ededed] transition-colors py-1">Search</a>
          </nav>
        </aside>

      <main className="flex-1 py-12 space-y-8 min-w-0">
        <div>
          <h1 className="text-2xl font-bold">API</h1>
          <p className="mt-2 text-sm text-[#555]">No auth. Rate limit: 100 req/min. Base URL: <code className="text-[#a0a0a0]">https://paste.db9.ai</code></p>
        </div>

        {/* POST */}
        <div id="create" className="scroll-mt-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#22c55e]/15 text-[#22c55e]">POST</span>
            <code className="text-sm font-mono text-[#a0a0a0]">/api/paste</code>
          </div>
          <table className="w-full text-xs font-mono">
            <tbody className="text-[#a0a0a0]">
              <tr className="border-t border-[#1a1a1a]"><td className="py-1.5 pr-4 text-[#ededed]">content <span className="text-[#ef4444]">*</span></td><td className="py-1.5 pr-4 text-[#7dd3fc]">string</td><td className="py-1.5">Markdown content</td></tr>
              <tr className="border-t border-[#1a1a1a]"><td className="py-1.5 pr-4 text-[#ededed]">chunk_size</td><td className="py-1.5 pr-4 text-[#7dd3fc]">number</td><td className="py-1.5">Chars per chunk. Default: 200</td></tr>
              <tr className="border-t border-[#1a1a1a]"><td className="py-1.5 pr-4 text-[#ededed]">ttl_hours</td><td className="py-1.5 pr-4 text-[#7dd3fc]">number</td><td className="py-1.5">Hours until expiry. Default: 168 (7d)</td></tr>
            </tbody>
          </table>
          <Code code={`curl -s -X POST https://paste.db9.ai/api/paste -H 'Content-Type: application/json' -d '{"content": "# Hello", "chunk_size": 200}'`}>
            <span className="text-[#22c55e]">$ </span><span className="text-[#ededed]">{`curl -s -X POST https://paste.db9.ai/api/paste \\
  -H 'Content-Type: application/json' \\
  -d '{"content": "# Hello", "chunk_size": 200}'`}</span>{"\n\n"}<span className="text-[#a0a0a0]">{`{"url":"https://paste.db9.ai/p/x7kQ...","id":"x7kQ..."}`}</span>
          </Code>
        </div>

        {/* GET */}
        <div id="read" className="scroll-mt-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#7dd3fc]/15 text-[#7dd3fc]">GET</span>
            <code className="text-sm font-mono text-[#a0a0a0]">{`/p/{id}`}</code>
          </div>
          <p className="text-sm text-[#a0a0a0]">Returns full markdown.</p>
          <Code code={`curl -s https://paste.db9.ai/p/{id}`}>
            <span className="text-[#22c55e]">$ </span><span className="text-[#ededed]">{`curl -s https://paste.db9.ai/p/{id}`}</span>
          </Code>
        </div>

        {/* Search */}
        <div id="search" className="scroll-mt-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#7dd3fc]/15 text-[#7dd3fc]">GET</span>
            <code className="text-sm font-mono text-[#a0a0a0]">{`/p/{id}?q=...&limit=N`}</code>
          </div>
          <table className="w-full text-xs font-mono">
            <tbody className="text-[#a0a0a0]">
              <tr className="border-t border-[#1a1a1a]"><td className="py-1.5 pr-4 text-[#ededed]">q</td><td className="py-1.5 pr-4 text-[#7dd3fc]">string</td><td className="py-1.5">Semantic search query</td></tr>
              <tr className="border-t border-[#1a1a1a]"><td className="py-1.5 pr-4 text-[#ededed]">limit</td><td className="py-1.5 pr-4 text-[#7dd3fc]">number</td><td className="py-1.5">Max results. Default: 3</td></tr>
            </tbody>
          </table>
          <Code code={`curl -s "https://paste.db9.ai/p/{id}?q=deploy&limit=1"`}>
            <span className="text-[#22c55e]">$ </span><span className="text-[#ededed]">{`curl -s "https://paste.db9.ai/p/{id}?q=deploy&limit=1"`}</span>{"\n\n"}<span className="text-[#7dd3fc]">## Deploy{"\n"}Use Vercel preview for staging.</span>
          </Code>
        </div>

        {/* Notes */}
        <div className="border-t border-[#1a1a1a] pt-6 text-sm text-[#555] space-y-1">
          <p>Pastes auto-expire. No auth, no rate limit, free.</p>
          <p>Content &gt; 100 chars is auto-indexed for semantic search.</p>
        </div>
      </main>
      </div>

      <Footer />
    </div>
  );
}

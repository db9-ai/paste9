"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "./components";

const SAMPLE_CONTENT = `# Meeting Notes

## Design
New landing page approved.
Ship by Friday.

## Backend
Add rate limiting to API.
Switch to Redis for sessions.

## Deploy
Use Vercel preview for staging.
Merge to main triggers production.`;

function TermShell({
  title,
  children,
  onRun,
  running,
  disabled,
  highlight,
  result,
  resultColor,
}: {
  title: string;
  children: React.ReactNode;
  onRun: () => void;
  running: boolean;
  disabled?: boolean;
  highlight?: boolean;
  result?: string;
  resultColor?: string;
}) {
  return (
    <div className="rounded-lg border border-[#2d2d2d] bg-[#141414] overflow-hidden flex flex-col">
      <div className="h-8 border-b border-[#2d2d2d] flex items-center px-3 relative">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
        </div>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-[#555] pointer-events-none">{title}</span>
        <button
          onClick={onRun}
          disabled={disabled || running}
          className={`ml-auto text-xs font-mono hover:text-[#ededed] disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer ${
            highlight && !disabled && !running ? "text-[#ededed] animate-[shake_0.4s_ease-in-out_infinite]" : "text-[#555]"
          }`}
        >
          {running ? (
            <span className="flex items-center gap-2 text-[#22c55e] bg-[#22c55e]/10 px-3 py-1 rounded-full animate-pulse">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Running...
            </span>
          ) : "▶ Run"}
        </button>
      </div>
      <div className="p-4 flex-1 font-mono text-xs leading-relaxed">
        {children}
        {result && (
          <>
            <div className={`whitespace-pre-wrap break-all leading-relaxed ${resultColor || "text-[#737373]"}`}>{result}</div>
            <div className="flex items-center mt-1">
              <span className="text-[#22c55e] shrink-0 select-none mr-2">$</span>
              <span className="inline-block w-1.5 h-3.5 bg-[#555] animate-pulse" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Demo() {
  const [origin, setOrigin] = useState("https://paste.db9.ai");
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const [pasteUrl, setPasteUrl] = useState("");
  const [postResult, setPostResult] = useState("");
  const [creating, setCreating] = useState(false);

  const [readResult, setReadResult] = useState("");
  const [reading, setReading] = useState(false);

  const [searchResult, setSearchResult] = useState("");
  const [searching, setSearching] = useState(false);

  async function handlePost() {
    setCreating(true);
    setPostResult("");
    setReadResult("");
    setSearchResult("");
    try {
      const res = await fetch("/api/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: SAMPLE_CONTENT, chunk_size: 80 }),
      });
      const data = await res.json();
      setPasteUrl(data.url);
      setPostResult(JSON.stringify(data));
    } finally {
      setCreating(false);
    }
  }

  async function handleRead() {
    if (!pasteUrl) return;
    setReading(true);
    setReadResult("");
    try {
      const res = await fetch(pasteUrl);
      setReadResult(await res.text());
    } finally {
      setReading(false);
    }
  }

  async function handleSearch() {
    if (!pasteUrl) return;
    setSearching(true);
    setSearchResult("");
    try {
      const res = await fetch(`${pasteUrl}?q=deploy&limit=1`);
      setSearchResult(await res.text());
    } finally {
      setSearching(false);
    }
  }

  return (
    <>
    <section className="border-t border-[#1a1a1a] px-6 py-14" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center">Try it as Human</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Create */}
          <div className="flex flex-col gap-3">
            <div className="text-sm font-mono text-[#ededed]">Create</div>
            <TermShell
              title="terminal"
              onRun={handlePost}
              running={creating}
              highlight={!pasteUrl}
              result={postResult}
            >
              <div className="text-[#22c55e]" suppressHydrationWarning>$ <span className="text-[#ededed]">curl -s -X POST {origin}/api/paste \</span></div>
              <div className="text-[#ededed] pl-4">-H &apos;Content-Type: application/json&apos; \</div>
              <div className="text-[#ededed] pl-4">-d &apos;{`{"content": "`}</div>
              <pre className="text-[#7dd3fc] whitespace-pre-wrap pl-4">{SAMPLE_CONTENT}</pre>
              <div className="text-[#ededed] pl-4 mb-2">{`", "chunk_size": 80}'`}</div>
            </TermShell>
          </div>

          {/* Right: Read + Search */}
          <div className="flex flex-col gap-3">
            <div className="text-sm font-mono text-[#ededed]">Read</div>
            <TermShell
              title="terminal"
              onRun={handleRead}
              running={reading}
              disabled={!pasteUrl}
              highlight={!!pasteUrl && !readResult}
              result={readResult}
              resultColor="text-[#7dd3fc]"
            >
              <div className="text-[#22c55e]" suppressHydrationWarning>
                $ <span className="text-[#ededed]">curl -s {pasteUrl || `${origin}/p/{token}`}</span>
              </div>
            </TermShell>

            <div className="text-sm font-mono"><span className="text-[#7dd3fc]">Semantic Search</span></div>
            <TermShell
              title="terminal"
              onRun={handleSearch}
              running={searching}
              disabled={!pasteUrl}
              highlight={!!pasteUrl && !searchResult}
              result={searchResult}
              resultColor="text-[#7dd3fc]"
            >
              <div className="text-[#22c55e]" suppressHydrationWarning>
                $ <span className="text-[#ededed]">curl -s &quot;{pasteUrl || `${origin}/p/{token}`}?q=deploy&amp;limit=1&quot;</span>
              </div>
            </TermShell>
          </div>
        </div>
      </div>
    </section>

    {/* Try it with Agents */}
    <section className="border-t border-[#1a1a1a] px-6 py-20">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Try it with Agents</h2>
        <p className="text-[#555] mb-8 text-sm">Copy to your agent&apos;s prompt or CLAUDE.md</p>
        <div className="inline-flex items-center gap-3 rounded-lg border border-[#2d2d2d] bg-[#141414] px-6 py-4" suppressHydrationWarning>
          <code className="font-mono text-[#ededed]">
            Read {origin}/skill.md and follow instructions
          </code>
          <CopyButton text={`Read ${origin}/skill.md and follow instructions`} />
        </div>
      </div>
    </section>
    </>
  );
}

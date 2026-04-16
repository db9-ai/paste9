"use client";

import { useState, useRef } from "react";

const LANGUAGES = [
  "text",
  "markdown",
  "javascript",
  "typescript",
  "python",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
  "sql",
  "html",
  "css",
  "json",
  "yaml",
  "toml",
  "bash",
  "dockerfile",
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="copy-btn shrink-0 p-1.5 text-gray-500 hover:text-white transition-colors"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      aria-label="Copy"
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      )}
    </button>
  );
}

export default function Home() {
  const [content, setContent] = useState("");
  const [lang, setLang] = useState("text");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit() {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, lang }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "https://paste9.vercel.app";
  const curlCmd = `echo 'your content' | curl -s -X POST ${origin}/api/paste -H 'Content-Type: application/json' -d @- --data-raw '{"content":"...","lang":"text"}'`;
  const agentCmd = `POST ${origin}/api/paste {"content":"...","lang":"markdown"}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col font-[family-name:var(--font-geist-sans)]">
      {/* Hero */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.08]">
            <span className="block">Paste it.</span>
            <span className="block text-[#737373]">
              Forget it<span className="animate-pulse">_</span>
            </span>
          </h1>
          <p className="mt-6 text-lg text-[#8c8c8c] max-w-xl mx-auto leading-relaxed">
            Ephemeral pastebin powered by{" "}
            <a href="https://db9.ai" className="text-[#ededed] hover:underline">db9</a>.
            Every paste gets its own serverless database. No accounts. No history. It just disappears.
          </p>
        </div>
      </section>

      {/* Install Cards */}
      <section className="px-6 pb-10">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-[#2d2d2d] bg-[#141414] p-4 hover:border-[#404040] transition-colors">
            <div className="text-xs font-mono text-[#737373] mb-2 uppercase tracking-wider">CLI</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-[#ededed] truncate">
                <span className="text-[#737373]">$</span> curl -s {origin}/api/paste -d ...
              </code>
              <CopyButton text={curlCmd} />
            </div>
            <p className="text-xs text-[#555] mt-2">pipe anything, get a link back</p>
          </div>
          <div className="rounded-lg border border-[#2d2d2d] bg-[#141414] p-4 hover:border-[#404040] transition-colors">
            <div className="text-xs font-mono text-[#737373] mb-2 uppercase tracking-wider">AI Agents</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-[#ededed] truncate">
                POST <span className="underline decoration-[#555]">/api/paste</span> {`{content, lang}`}
              </code>
              <CopyButton text={agentCmd} />
            </div>
            <p className="text-xs text-[#555] mt-2">raw markdown at <code className="text-[#737373]">/p/{`{id}`}/raw</code></p>
          </div>
        </div>
      </section>

      {/* Editor */}
      <section className="flex-1 flex flex-col px-6 pb-8">
        <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col gap-3">
          <div className="flex-1 relative rounded-lg border border-[#2d2d2d] bg-[#141414] overflow-hidden hover:border-[#404040] transition-colors focus-within:border-[#555]">
            <div className="absolute top-0 left-0 right-0 h-9 bg-[#141414] border-b border-[#2d2d2d] flex items-center px-4 gap-2 z-10">
              <span className="w-3 h-3 rounded-full bg-[#333]" />
              <span className="w-3 h-3 rounded-full bg-[#333]" />
              <span className="w-3 h-3 rounded-full bg-[#333]" />
              <span className="flex-1 text-center text-xs font-mono text-[#555]">paste9</span>
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste your content here..."
              className="w-full h-full min-h-[40vh] bg-transparent pt-12 pb-4 px-4 font-mono text-sm text-[#ededed] placeholder-[#333] resize-none focus:outline-none"
              autoFocus
              spellCheck={false}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-[#141414] border border-[#2d2d2d] rounded-lg px-3 py-2 text-sm font-mono text-[#8c8c8c] focus:outline-none focus:border-[#555] hover:border-[#404040] transition-colors appearance-none cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <span className="text-xs text-[#333] hidden sm:inline">
                {"\u2318"}+Enter to submit
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              className="bg-[#ededed] text-[#0a0a0a] font-semibold px-6 py-2 rounded-lg text-sm hover:bg-white disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? "Creating..." : "Create Paste"}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-[#555]">
          <span className="font-mono">paste9</span>
          <span>
            powered by{" "}
            <a href="https://db9.ai" className="text-[#8c8c8c] hover:text-[#ededed] transition-colors">
              db9
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

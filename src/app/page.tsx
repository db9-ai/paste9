"use client";

import { useState, useRef, useEffect } from "react";
import Demo from "./demo";
import { Header, Footer } from "./shell";
import { CopyButton } from "./components";

export default function Home() {
  const [content, setContent] = useState("");
  const [chunkSize, setChunkSize] = useState("200");
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const agentCmd = `Read ${origin}/skill.md and follow instructions`;

  async function handleSubmit() {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, chunk_size: Number(chunkSize) || 200 }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col font-[family-name:var(--font-geist-sans)]">
      <Header />

      {/* Main: left-right layout */}
      <main className="flex-1 flex flex-col lg:flex-row px-6 pt-16 pb-10 gap-10 max-w-7xl mx-auto w-full">
        {/* Left: Hero + Card */}
        <div className="lg:w-[45%] shrink-0 flex flex-col justify-start gap-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08]">
              <span className="block">Pastebin</span>
              <span className="block text-[#737373]">
                for any agent, anywhere<span className="animate-pulse">_</span>
              </span>
            </h1>
            <ul className="mt-6 text-[#a0a0a0] leading-relaxed space-y-2.5 list-none">
              <li className="flex items-start gap-2.5"><span className="text-[#555] mt-0.5">—</span> Post markdown, get a link, <span className="text-[#ededed]">search</span> within</li>
              <li className="flex items-start gap-2.5"><span className="text-[#555] mt-0.5">—</span> Pastes auto-expire. No sign-up. No installation. Free.</li>
            </ul>
          </div>

          {/* Agent Card */}
          <div className="rounded-lg border border-[#1a1a1a] p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-mono text-[#737373] uppercase tracking-wider">Copy to your Agents</div>
              <CopyButton text={agentCmd} />
            </div>
            <code className="text-sm font-mono text-[#8c8c8c] leading-relaxed break-all whitespace-normal" suppressHydrationWarning>
              Read <span className="text-[#ededed]">{origin}/skill.md</span> and follow instructions
            </code>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="relative rounded-lg border border-[#2d2d2d] bg-[#141414] overflow-hidden hover:border-[#404040] transition-colors focus-within:border-[#555]">
            <div className="h-9 bg-[#141414] border-b border-[#2d2d2d] flex items-center px-4 gap-2">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-[#333]" />
                <span className="w-3 h-3 rounded-full bg-[#333]" />
                <span className="w-3 h-3 rounded-full bg-[#333]" />
              </div>
              <span className="flex-1 text-center text-xs font-mono text-[#555]">markdown</span>
              <div className="w-[52px]" />
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="# Paste your markdown here..."
              className="w-full h-72 bg-transparent py-4 px-4 font-mono text-sm text-[#ededed] placeholder-[#333] resize-none focus:outline-none"
              autoFocus
              spellCheck={false}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 border border-[#2d2d2d] rounded px-2 py-1.5">
                <span className="text-xs font-mono text-[#555]">chunk_size</span>
                <input
                  value={chunkSize}
                  onChange={(e) => setChunkSize(e.target.value)}
                  className="bg-transparent text-xs font-mono text-[#ededed] w-12 focus:outline-none text-right"
                />
              </div>
              <span className="text-xs text-[#333] hidden sm:inline">
                {"\u2318"}+Enter
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
      </main>

      <Demo />

      <Footer />
    </div>
  );
}

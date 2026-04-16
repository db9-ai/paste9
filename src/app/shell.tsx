"use client";

import { useState } from "react";

const navLinks = [
  { href: "/docs", label: "API", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17l6-6-6-6"/><path d="M12 19h8"/></svg> },
  { href: "/skill.md", label: "skill.md", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { href: "/about", label: "About", icon: null },
  { href: "https://github.com/db9-ai/paste9", label: "GitHub", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg> },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[#1a1a1a] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <img src="/icon.svg" alt="Paste9" width={28} height={28} className="sm:w-9 sm:h-9" />
          <span className="font-mono font-bold text-base sm:text-lg text-white">Paste9</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-5 text-sm font-mono">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="flex items-center gap-1.5 text-[#999] hover:text-[#ededed] transition-colors">{l.icon}{l.label}</a>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden text-[#999] hover:text-[#ededed] transition-colors cursor-pointer"
          aria-label="Menu"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav className="sm:hidden mt-3 pt-3 border-t border-[#1a1a1a] flex flex-col gap-3 font-mono text-sm">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="flex items-center gap-1.5 text-[#999] hover:text-[#ededed] transition-colors">{l.icon}{l.label}</a>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] px-6 py-5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#555]">
        <div className="flex items-center gap-2.5">
          <img src="/icon.svg" alt="Paste9" width={16} height={16} className="opacity-50" />
          <span className="font-mono">&copy; {new Date().getFullYear()} Paste9</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <a href="/skill.md" className="hover:text-[#8c8c8c] transition-colors">skill.md</a>
          <a href="https://github.com/db9-ai/paste9" className="hover:text-[#8c8c8c] transition-colors">GitHub</a>
          <a href="https://db9.ai" className="hover:text-[#8c8c8c] transition-colors">powered by db9</a>
        </div>
      </div>
    </footer>
  );
}

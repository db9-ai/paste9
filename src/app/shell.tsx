"use client";

import { useState } from "react";

const navLinks = [
  { href: "/docs", label: "API" },
  { href: "/skill.md", label: "skill.md" },
  { href: "/about", label: "About" },
  { href: "https://github.com/db9-ai/paste9", label: "GitHub" },
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
            <a key={l.href} href={l.href} className="text-[#999] hover:text-[#ededed] transition-colors">{l.label}</a>
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
            <a key={l.href} href={l.href} className="text-[#999] hover:text-[#ededed] transition-colors">{l.label}</a>
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

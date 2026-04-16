"use client";

import { useState } from "react";

export default function CopyBlock({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="text-[#737373] hover:text-white transition-colors font-mono text-xs cursor-pointer"
      onClick={() => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

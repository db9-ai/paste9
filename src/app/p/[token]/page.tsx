import { notFound } from "next/navigation";
import { readPaste } from "@/lib/db9";
import { codeToHtml } from "shiki";
import type { Metadata } from "next";
import CopyBlock from "./copy-block";

type Params = Promise<{ token: string }>;

export async function generateMetadata(): Promise<Metadata> {
  return { title: "paste9" };
}

export default async function PastePage({
  params,
}: {
  params: Params;
}) {
  const { token } = await params;
  const paste = await readPaste(token);
  if (!paste) notFound();

  const html = await codeToHtml(paste.content, {
    lang: paste.lang,
    theme: "github-dark",
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-[family-name:var(--font-geist-sans)]">
      <header className="border-b border-[#2d2d2d] px-6 py-3 flex items-center justify-between">
        <a href="/" className="text-sm font-mono font-bold text-white hover:opacity-80 transition-opacity">
          paste9
        </a>
        <div className="flex items-center gap-3 text-sm">
          <span className="px-2 py-0.5 rounded border border-[#2d2d2d] bg-[#141414] text-[#8c8c8c] font-mono text-xs">
            {paste.lang}
          </span>
          <CopyBlock content={paste.content} />
          <a
            href={`/p/${token}/raw`}
            className="text-[#737373] hover:text-white transition-colors font-mono text-xs"
          >
            raw
          </a>
        </div>
      </header>
      <main>
        <div
          className="[&_pre]:!bg-[#0a0a0a] [&_pre]:!p-6 [&_pre]:!m-0 [&_pre]:!rounded-none [&_code]:text-sm [&_code]:font-[family-name:var(--font-geist-mono)] [&_.line]:leading-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </div>
  );
}

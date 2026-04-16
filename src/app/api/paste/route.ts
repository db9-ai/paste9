import { NextRequest, NextResponse } from "next/server";
import { createPaste } from "@/lib/db9";

export async function POST(req: NextRequest) {
  const { content, lang } = await req.json();

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const token = await createPaste(content, lang || "text");
  return NextResponse.json({ token, url: `/p/${token}` });
}

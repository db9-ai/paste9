import { NextRequest, NextResponse } from "next/server";
import { createPaste } from "@/lib/db9";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const content = body?.content;
  const chunkSize = body?.chunk_size;

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  try {
    const token = await createPaste(content, {
      chunkSize: chunkSize ? Number(chunkSize) : undefined,
    });
    const origin = req.nextUrl.origin;
    return NextResponse.json({
      url: `${origin}/p/${token}`,
      token,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create paste" },
      { status: 500 }
    );
  }
}

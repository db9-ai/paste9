import { NextRequest, NextResponse } from "next/server";
import { createPaste } from "@/lib/db9";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "rate limit exceeded" }, { status: 429 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const content = body?.content;
  const chunkSize = body?.chunk_size;
  const ttlHours = body?.ttl_hours;

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const parsedChunkSize = chunkSize ? Number(chunkSize) : undefined;
  if (parsedChunkSize !== undefined && (!Number.isFinite(parsedChunkSize) || parsedChunkSize < 1 || parsedChunkSize > 10000)) {
    return NextResponse.json({ error: "chunk_size must be 1-10000" }, { status: 400 });
  }

  try {
    const id = await createPaste(content, {
      chunkSize: parsedChunkSize,
      ttlHours: ttlHours ? Number(ttlHours) : undefined,
    });
    const origin = req.nextUrl.origin;
    return NextResponse.json({ url: `${origin}/p/${id}`, id });
  } catch {
    return NextResponse.json({ error: "Failed to create paste" }, { status: 500 });
  }
}

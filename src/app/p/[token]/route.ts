import { NextRequest } from "next/server";
import { readPaste } from "@/lib/db9";

type Params = Promise<{ token: string }>;

export async function GET(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { token: id } = await params;
  const query = req.nextUrl.searchParams.get("q") || undefined;
  const limitRaw = req.nextUrl.searchParams.get("limit");
  const parsedLimit = limitRaw ? Math.min(Math.max(Math.floor(Number(limitRaw)), 1), 100) : undefined;

  const content = await readPaste(id, {
    query,
    limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
  });
  if (!content) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(content, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

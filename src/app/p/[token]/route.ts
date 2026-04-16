import { NextRequest } from "next/server";
import { readPaste } from "@/lib/db9";

type Params = Promise<{ token: string }>;

export async function GET(
  req: NextRequest,
  { params }: { params: Params }
) {
  const { token } = await params;
  const query = req.nextUrl.searchParams.get("q") || undefined;
  const limit = req.nextUrl.searchParams.get("limit");
  const content = await readPaste(token, {
    query,
    limit: limit ? Number(limit) : undefined,
  });
  if (!content) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(content, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

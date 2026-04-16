import { NextRequest } from "next/server";
import { readPaste } from "@/lib/db9";

type Params = Promise<{ token: string }>;

export async function GET(
  _req: NextRequest,
  { params }: { params: Params }
) {
  const { token } = await params;
  const paste = await readPaste(token);
  if (!paste) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(paste.content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

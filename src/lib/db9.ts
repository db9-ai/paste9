import { createDb9Client } from "get-db9";

const client = createDb9Client();

export interface PasteToken {
  dbId: string;
  password: string;
}

export function encodeToken(dbId: string, password: string): string {
  return Buffer.from(`${dbId}:${password}`).toString("base64url");
}

export function decodeToken(token: string): PasteToken {
  const decoded = Buffer.from(token, "base64url").toString();
  const idx = decoded.indexOf(":");
  if (idx === -1) throw new Error("Invalid token");
  return {
    dbId: decoded.slice(0, idx),
    password: decoded.slice(idx + 1),
  };
}

export async function createPaste(
  content: string,
  lang: string
): Promise<string> {
  const name = `p9-${Date.now().toString(36)}`;
  const db = await client.databases.create({ name });
  const creds = await client.databases.credentials(db.id);
  const password = creds.admin_password;

  await client.fs.write(db.id, "/paste", content);
  await client.fs.write(db.id, "/meta", JSON.stringify({ lang }));

  return encodeToken(db.id, password);
}

export async function readPaste(
  token: string
): Promise<{ content: string; lang: string } | null> {
  try {
    const { dbId } = decodeToken(token);
    const [content, metaRaw] = await Promise.all([
      client.fs.read(dbId, "/paste"),
      client.fs.read(dbId, "/meta"),
    ]);
    const meta = JSON.parse(metaRaw);
    return { content, lang: meta.lang || "text" };
  } catch {
    return null;
  }
}

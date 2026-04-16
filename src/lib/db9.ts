import { createDb9Client } from "get-db9";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const client = createDb9Client();

const DEFAULT_CHUNK_SIZE = 200;
const DEFAULT_CHUNK_OVERLAP = 20;
const DEFAULT_SEARCH_LIMIT = 3;
const SEARCH_THRESHOLD = 100;

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

// --- Chunking ---

async function chunkMarkdown(
  content: string,
  chunkSize = DEFAULT_CHUNK_SIZE
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: Math.min(DEFAULT_CHUNK_OVERLAP, Math.floor(chunkSize / 5)),
  });
  const docs = await splitter.createDocuments([content]);
  return docs.map((d) => d.pageContent);
}

// --- Search schema + indexing ---

function escapeSQL(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/'/g, "''");
}

async function initSearch(
  dbId: string,
  chunks: string[]
): Promise<boolean> {
  try {
    await client.databases.sql(dbId, `SET standard_conforming_strings = on;`);
    await client.databases.sql(dbId, `CREATE EXTENSION IF NOT EXISTS embedding;`);
    await client.databases.sql(
      dbId,
      `CREATE TABLE IF NOT EXISTS chunks (
        id SERIAL PRIMARY KEY,
        idx INTEGER NOT NULL,
        body TEXT NOT NULL,
        vec VECTOR
      );`
    );

    // Batch insert all chunks in one SQL call
    const values = chunks
      .map((chunk, i) => {
        const escaped = escapeSQL(chunk);
        return `(${i}, '${escaped}', embedding('${escaped}'))`;
      })
      .join(", ");
    await client.databases.sql(
      dbId,
      `INSERT INTO chunks (idx, body, vec) VALUES ${values};`
    );

    return true;
  } catch {
    return false;
  }
}

// --- Search query ---

async function searchChunks(
  dbId: string,
  query: string,
  limit = DEFAULT_SEARCH_LIMIT
): Promise<string | null> {
  try {
    const result = await client.databases.sql(
      dbId,
      `SELECT idx, body FROM chunks
       ORDER BY vec <=> embedding('${escapeSQL(query)}')
       LIMIT ${limit};`
    );
    if (!result.rows || result.rows.length === 0) return null;

    const sorted = [...result.rows].sort(
      (a: unknown[], b: unknown[]) => (a[0] as number) - (b[0] as number)
    );
    return sorted.map((row: unknown[]) => row[1] as string).join("\n\n");
  } catch {
    return null;
  }
}

// --- Public API ---

export interface CreatePasteOptions {
  chunkSize?: number;
}

export async function createPaste(
  content: string,
  options?: CreatePasteOptions
): Promise<string> {
  const name = `p9-${Date.now().toString(36)}`;
  const db = await client.databases.create({ name });
  const creds = await client.databases.credentials(db.id);
  const password = creds.admin_password;

  await client.fs.write(db.id, "/paste.md", content);

  let searchEnabled = false;
  if (content.length > SEARCH_THRESHOLD) {
    try {
      const chunks = await chunkMarkdown(content, options?.chunkSize);
      searchEnabled = await initSearch(db.id, chunks);
    } catch {
      // search setup failed, paste still works without it
    }
  }

  await client.fs.write(
    db.id,
    "/paste.meta.json",
    JSON.stringify({ searchEnabled })
  );

  return encodeToken(db.id, password);
}

export interface ReadPasteOptions {
  query?: string;
  limit?: number;
}

export async function readPaste(
  token: string,
  options?: ReadPasteOptions
): Promise<string | null> {
  try {
    const { dbId } = decodeToken(token);

    if (options?.query) {
      try {
        const metaRaw = await client.fs.read(dbId, "/paste.meta.json");
        const meta = JSON.parse(metaRaw);
        if (meta.searchEnabled) {
          const result = await searchChunks(dbId, options.query, options.limit);
          if (result) return result;
        }
      } catch {
        // fall through to full document
      }
    }

    return await client.fs.read(dbId, "/paste.md");
  } catch {
    return null;
  }
}

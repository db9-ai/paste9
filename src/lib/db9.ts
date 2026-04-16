import pg from "pg";
import { randomUUID } from "crypto";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const DEFAULT_CHUNK_SIZE = 200;
const SEARCH_THRESHOLD = 100;
const DEFAULT_SEARCH_LIMIT = 3;
const DEFAULT_TTL_MINUTES = 300; // 5 hours

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL?.replace(/[?&]sslmode=[^&]*/g, ""),
  ssl: false,
});

function escapeSQL(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/'/g, "''");
}

// --- Schema init (runs once) ---

let schemaReady = false;

async function ensureSchema() {
  if (schemaReady) return;
  await pool.query(`CREATE EXTENSION IF NOT EXISTS embedding`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pastes (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chunks (
      id SERIAL PRIMARY KEY,
      paste_id TEXT NOT NULL REFERENCES pastes(id) ON DELETE CASCADE,
      idx INTEGER NOT NULL,
      body TEXT NOT NULL,
      vec VECTOR
    )
  `);
  // Cleanup handled by maybeCleanup() on each read (1% probability)
  schemaReady = true;
}

// --- Chunking ---

async function chunkContent(
  content: string,
  chunkSize = DEFAULT_CHUNK_SIZE
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: Math.min(20, Math.floor(chunkSize / 5)),
  });
  const docs = await splitter.createDocuments([content]);
  return docs.map((d) => d.pageContent);
}

// --- Lazy cleanup (1% chance per read) ---

function maybeCleanup() {
  if (Math.random() < 0.01) {
    pool.query(`DELETE FROM pastes WHERE expires_at < now()`).catch(() => {});
  }
}

// --- Public API ---

export interface CreatePasteOptions {
  chunkSize?: number;
  ttlMinutes?: number;
}

export async function createPaste(
  content: string,
  options?: CreatePasteOptions
): Promise<string> {
  await ensureSchema();

  const id = randomUUID();
  const ttl = options?.ttlMinutes || DEFAULT_TTL_MINUTES;

  await pool.query(
    `INSERT INTO pastes (id, content, expires_at) VALUES ($1, $2, now() + ($3::int || ' minutes')::interval)`,
    [id, content, ttl]
  );

  // Index chunks for search
  if (content.length > SEARCH_THRESHOLD) {
    try {
      const chunks = await chunkContent(content, options?.chunkSize);
      if (chunks.length > 0) {
        const values = chunks
          .map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3}, embedding($${i * 2 + 3}))`)
          .join(", ");
        const params: (string | number)[] = [id];
        chunks.forEach((chunk, i) => {
          params.push(i, chunk);
        });
        await pool.query(
          `INSERT INTO chunks (paste_id, idx, body, vec) VALUES ${values}`,
          params
        );
      }
    } catch {
      // search indexing failed, paste still works
    }
  }

  return id;
}

export interface ReadPasteOptions {
  query?: string;
  limit?: number;
}

export async function readPaste(
  id: string,
  options?: ReadPasteOptions
): Promise<string | null> {
  try {
    await ensureSchema();
    maybeCleanup();

    if (options?.query) {
      const limit = options.limit || DEFAULT_SEARCH_LIMIT;
      const result = await pool.query(
        `SELECT idx, body FROM chunks
         WHERE paste_id = $1
         ORDER BY vec <=> embedding($2)
         LIMIT $3`,
        [id, options.query, limit]
      );
      if (result.rows.length > 0) {
        const sorted = [...result.rows].sort((a, b) => a.idx - b.idx);
        return sorted.map((r) => r.body).join("\n\n");
      }
    }

    const result = await pool.query(
      `UPDATE pastes SET expires_at = now() + (${DEFAULT_TTL_MINUTES}::int || ' minutes')::interval
       WHERE id = $1 AND expires_at > now()
       RETURNING content`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return result.rows[0].content;
  } catch {
    return null;
  }
}

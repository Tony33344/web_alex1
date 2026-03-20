import { Pool } from 'pg';

// Direct PostgreSQL connection - bypasses PostgREST schema cache issues
let pool: Pool | null = null;

function getPool(): Pool | null {
  if (!pool && process.env.SUPABASE_DB_URL) {
    pool = new Pool({
      connectionString: process.env.SUPABASE_DB_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });
  }
  return pool;
}

export async function queryDirect(sql: string, params?: any[]) {
  const p = getPool();
  if (!p) {
    return { data: null, error: new Error('SUPABASE_DB_URL not configured - direct DB connection unavailable') };
  }
  try {
    const client = await p.connect();
    try {
      const result = await client.query(sql, params);
      return { data: result.rows, error: null };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Direct DB query error:', error);
    return { data: null, error };
  }
}

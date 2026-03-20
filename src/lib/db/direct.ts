import { Pool } from 'pg';

// Direct PostgreSQL connection - bypasses PostgREST schema cache issues
const pool = process.env.SUPABASE_DB_URL ? new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
}) : null;

export async function queryDirect(sql: string, params?: any[]) {
  if (!pool) throw new Error('SUPABASE_DB_URL not configured');
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return { data: result.rows, error: null };
  } catch (error) {
    return { data: null, error };
  } finally {
    client.release();
  }
}

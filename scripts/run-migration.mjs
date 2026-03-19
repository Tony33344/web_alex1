import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('');
  console.error('ERROR: DATABASE_URL env var not set.');
  console.error('');
  console.error('To get your connection string:');
  console.error('1. Go to https://supabase.com/dashboard → your project → Settings → Database');
  console.error('2. Copy the "Connection string" (URI format)');
  console.error('3. Run: DATABASE_URL="postgresql://..." node scripts/run-migration.mjs');
  console.error('');
  console.error('OR paste the SQL manually in the Supabase Dashboard → SQL Editor');
  console.error('File: supabase/migrations/001_initial_schema.sql');
  process.exit(1);
}

const sqlFile = resolve(__dirname, '../supabase/migrations/001_initial_schema.sql');
const sql = readFileSync(sqlFile, 'utf-8');

console.log('Connecting to database...');
const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('Connected. Running migration...');
  await client.query(sql);
  console.log('✅ Migration completed successfully! All tables created.');
} catch (err) {
  console.error('❌ Migration failed:', err.message);
  if (err.message.includes('already exists')) {
    console.log('(Some tables may already exist — this is OK)');
  }
} finally {
  await client.end();
}

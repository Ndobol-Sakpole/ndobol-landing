import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL in .env before running npm run db:migrate.');
const sql = neon(process.env.DATABASE_URL);
const source = await readFile(new URL('../data/migrations/001-playtest.sql', import.meta.url), 'utf8');
try {
  const statements = source.split(';').map(text => text.trim()).filter(Boolean);
  await sql.transaction(statements.map(text => sql.query(text)));
  console.log('Playtest schema is ready. Existing registrations were kept.');
} catch {
  console.error('Migration failed. Check DATABASE_URL, database access, and the SQL migration.');
  process.exitCode = 1;
}

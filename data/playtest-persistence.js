import { neon } from '@neondatabase/serverless';
import { createPostgresStore } from './postgres-playtest-store.js';

export function persistentStore(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    const unavailable = async () => { throw new Error('Playtest storage is not configured'); };
    return { register: unavailable, cancel: unavailable, allowRequest: unavailable };
  }
  const sql = neon(connectionString);
  return createPostgresStore((text, parameters) => sql.query(text, parameters, {
    fetchOptions: { signal: AbortSignal.timeout(5000) }
  }), connectionString);
}

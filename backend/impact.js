import { DatabaseSync } from 'node:sqlite';

export const unavailableImpact = () => ({
  status: 'unavailable', environment: 'development', gameItems: null, rounds: null,
  physicalKg: null, carbonKgCO2e: null, updatedAt: null
});

// Only aggregate saved human results. No wallet, session, or player data leaves this endpoint.
export function readImpact(databasePath) {
  let db;
  try {
    db = new DatabaseSync(databasePath, { readOnly: true });
    const totals = db.prepare(`SELECT COUNT(DISTINCT r.id) AS rounds,
      COALESCE(SUM(p.trash), 0) AS items
      FROM rounds r JOIN round_players p ON p.round_id = r.id
      WHERE r.mode = 'online' AND p.bot = 0`).get();
    if (![totals.items, totals.rounds].every(n => Number.isSafeInteger(n) && n >= 0)) return unavailableImpact();
    return { status: 'available', environment: 'development', gameItems: totals.items,
      rounds: totals.rounds, physicalKg: null, carbonKgCO2e: null, updatedAt: new Date().toISOString() };
  } catch {
    // A missing database or schema is unavailable, never a fabricated zero.
    return unavailableImpact();
  } finally { db?.close(); }
}

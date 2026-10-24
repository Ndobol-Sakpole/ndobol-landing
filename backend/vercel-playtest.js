import { isIP } from 'node:net';
import { createPlaytestHandler } from './playtest.js';
import { persistentStore } from '../data/playtest-persistence.js';

let handler;
export async function handleVercelPlaytest(req, res, pathname) {
  handler ??= createPlaytestHandler({
    store: persistentStore(),
    getClientAddress(request) {
      // Only Vercel's runtime may supply the trusted proxy address.
      const forwarded = process.env.VERCEL === '1' ? request.headers['x-forwarded-for']?.split(',')[0].trim() : null;
      return isIP(forwarded || '') ? forwarded : request.socket?.remoteAddress || 'unknown';
    }
  });
  return handler(req, res, pathname);
}

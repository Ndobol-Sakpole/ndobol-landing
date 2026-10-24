// These values are rendered at build time; no server credentials belong here.
const gameUrl = process.env.GAME_URL?.trim() || 'https://ndobol-game-teal.vercel.app/apps/web/index.html';
if (gameUrl) {
  const parsed = new URL(gameUrl);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('GAME_URL must be a public HTTP(S) URL.');
}
const siteUrl = process.env.SITE_URL?.trim() || '';
if (siteUrl) {
  const parsed = new URL(siteUrl);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) throw new Error('SITE_URL must be a public HTTP(S) origin without a path or credentials.');
}
export const site = Object.freeze({
  origin: siteUrl ? new URL(siteUrl).origin : '',
  playUrl: gameUrl,
  playLabel: 'Coba demo',
  repositoryUrl: 'https://github.com/Ndobol-Sakpole/ndobol-game',
  socials: Object.freeze([
    { id: 'github', name: 'GitHub', url: 'https://github.com/Ndobol-Sakpole/ndobol-game' },
    { id: 'x', name: 'X', url: 'https://x.com/NdobolSakpole' },
    { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/company/ndobol-sesarengan/' }
  ]),
  monadDocsUrl: 'https://docs.monad.xyz/introduction/monad-for-developers',
  credit: 'Created by Ndobol Sesarengan - Monad Blitz Hackathon team DeEs.'
});
export const featuredCharacterIds = ['anjing', 'monyet', 'tupai', 'babi'];

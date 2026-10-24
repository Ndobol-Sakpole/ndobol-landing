import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { readImpact } from '../backend/impact.js';
import { simulateReward, formatMonAmount } from '../frontend/lib/economy.js';
import { rewardProposal, revenueAllocation, raftEconomy } from '../data/economy.js';
import { rafts } from '../data/catalog.js';
import { RAFTS } from '../shared/game/rafts.js';
import { REWARDS, rewardWei } from '../shared/game/rewards.js';
import { renderPage } from '../backend/render.js';

test('MON prices use the game catalogue and small weight rewards retain exact precision', () => {
  assert.deepEqual(raftEconomy.map(item => item.id), rafts.map(item => item.id));
  for (const raft of raftEconomy) assert.equal(raft.priceWei, RAFTS[raft.id].priceWei);
  assert.equal(rewardProposal.weiPerGram, String(REWARDS.weiPerGram));
  const targetPriceWei = RAFTS['ban-bekas'].priceWei;
  const simulate = (weightGrams, finishReason = 'finished') => simulateReward({ weightGrams, finishReason, targetPriceWei }, rewardProposal);
  const reward = simulate(15000);
  assert.equal(reward.rewardWei, targetPriceWei);
  assert.equal(reward.remainingGrams, 0);
  assert.equal(formatMonAmount(targetPriceWei), '0,00015 MON');
  assert.equal(formatMonAmount(targetPriceWei, 'en'), '0.00015 MON');
  assert.equal(formatMonAmount(simulate(1).rewardWei), '0,00000001 MON');
  assert.equal(simulate(14999).remainingGrams, 1);
  assert.equal(simulate(0).remainingGrams, 15000);
  for (const grams of [0, 1, 12, 35, 1000, 15000, 1000000000]) {
    assert.equal(simulate(grams).rewardWei, rewardWei(grams));
  }
  for (const reason of ['capsized','sunk']) {
    assert.equal(simulate(15000, reason).rewardWei, '0');
    assert.equal(simulate(15000, reason).remainingGrams, 15000);
    assert.equal(simulate(15000, reason).eligible, false);
  }
  for (const grams of [-1, NaN, Infinity, 1.5, 1000000001]) assert.equal(simulate(grams), null);
  assert.equal(simulate(15000, 'pending'), null);
  assert.equal(simulateReward({ weightGrams: 0, finishReason: 'finished', targetPriceWei: '-1' }, rewardProposal), null);
  assert.equal(revenueAllocation.reduce((n, item) => n + item.percent, 0), 100);
});

test('both languages show MON prices and no obsolete dollar or seasonal-points model', () => {
  for (const route of ['/ekonomi','/en/ekonomi']) {
    const { html } = renderPage(route);
    assert.doesNotMatch(html, /US\$|USD|sim-personal|sim-total|sim-revenue/);
    assert.match(html, /0[,.]00015 MON/);
    assert.match(html, /id="sim-weight"/);
    assert.match(html, /id="sim-result"/);
  }
});

test('impact totals exclude bots and offline rounds, count rounds once, and never invent physical impact', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'ndobol-impact-'));
  try {
    const database = path.join(directory, 'results.sqlite');
    const db = new DatabaseSync(database);
    db.exec(`CREATE TABLE rounds(id TEXT PRIMARY KEY, mode TEXT);
      CREATE TABLE round_players(round_id TEXT, bot INTEGER, trash INTEGER);
      INSERT INTO rounds VALUES ('a','online'),('b','online'),('c','offline'),('d','online');
      INSERT INTO round_players VALUES ('a',0,3),('a',0,4),('a',1,50),('b',0,2),('c',0,100),('d',1,70);`);
    db.close();
    const result = readImpact(database);
    assert.equal(result.status, 'available');
    assert.equal(result.gameItems, 9);
    assert.equal(result.rounds, 2);
    assert.equal(result.physicalKg, null);
    assert.equal(result.carbonKgCO2e, null);
    assert.equal(result.environment, 'development');
    assert.deepEqual(Object.keys(result).sort(), ['status','environment','gameItems','rounds','physicalKg','carbonKgCO2e','updatedAt'].sort());
    const missing = path.join(directory, 'missing.sqlite');
    assert.equal(readImpact(missing).status, 'unavailable');
    assert.equal(readImpact(missing).gameItems, null);
    assert.equal(existsSync(missing), false);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

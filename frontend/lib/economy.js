import { formatMon } from '../../shared/game/rewards.js';

// Preserve sub-cent MON values exactly; never round crypto amounts to fiat cents.
export function formatMonAmount(wei, language = 'id') {
  return `${formatMon(wei).replace('.', language === 'id' ? ',' : '.')} MON`;
}

// This preview uses integer grams and wei, matching the game's reward model.
// It calculates eligibility, not a funded or claimable wallet balance.
export function simulateReward({ weightGrams, finishReason, targetPriceWei }, rules) {
  if (!Number.isSafeInteger(weightGrams) || weightGrams < 0 || weightGrams > 1_000_000_000) return null;
  if (!['finished', 'capsized', 'sunk'].includes(finishReason)) return null;
  if (!/^\d+$/.test(targetPriceWei) || !/^\d+$/.test(rules.weiPerGram)) return null;
  const rate = BigInt(rules.weiPerGram);
  if (rate <= 0n) return null;
  const eligible = finishReason === 'finished';
  const reward = eligible ? BigInt(weightGrams) * rate : 0n;
  const target = BigInt(targetPriceWei);
  const shortfall = target > reward ? target - reward : 0n;
  return { rewardWei: String(reward), targetPriceWei, remainingGrams: Number((shortfall + rate - 1n) / rate), eligible };
}

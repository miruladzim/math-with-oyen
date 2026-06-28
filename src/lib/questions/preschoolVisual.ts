import { COUNTING_EMOJI, emojiRepeat, pickRandomEmoji } from '../kidFriendlyEmojis';
import type { PreschoolVisualMeta } from '../types';

export function buildCompareVisual(a: number, b: number, askBigger: boolean): PreschoolVisualMeta {
  return {
    kind: 'compare',
    emoji: pickRandomEmoji(COUNTING_EMOJI),
    groupA: a,
    groupB: b,
    askBigger,
  };
}

export function renderCompareGroups(meta: PreschoolVisualMeta): { left: string; right: string } {
  const emoji = meta.emoji ?? '⭐';
  const left = emojiRepeat(emoji, meta.groupA ?? 0);
  const right = emojiRepeat(emoji, meta.groupB ?? 0);
  return { left, right };
}

export function parsePatternSequence(prompt: string): string[] {
  const lines = prompt.split('\n');
  if (lines.length < 2) return [];
  return lines[1].trim().split(/\s+/).filter(Boolean);
}

export function buildPatternVisual(sequence: string[]): PreschoolVisualMeta {
  return { kind: 'pattern', sequence };
}

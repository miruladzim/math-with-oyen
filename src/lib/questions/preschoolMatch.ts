import type { Language } from '../i18n/types';
import { COUNTING_EMOJI, emojiRepeat, pickRandomEmoji } from '../kidFriendlyEmojis';
import { getQuestionStrings } from '../i18n/translations';

export interface PreschoolMatchCard {
  id: string;
  text: string;
  pairId: string;
  type: 'visual' | 'numeral' | 'shape' | 'name';
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function buildPreschoolMatchDeck(language: Language): PreschoolMatchCard[] {
  const qs = getQuestionStrings(language);
  const pairs: PreschoolMatchCard[] = [];
  const usedCounts = new Set<number>();

  for (let i = 0; i < 3; i++) {
    let count = randInt(1, 5);
    while (usedCounts.has(count)) {
      count = randInt(1, 5);
    }
    usedCounts.add(count);

    const emoji = pickRandomEmoji(COUNTING_EMOJI);
    const pairId = `pair-${i}`;
    pairs.push({
      id: `${pairId}-visual`,
      text: emojiRepeat(emoji, count),
      pairId,
      type: 'visual',
    });
    pairs.push({
      id: `${pairId}-numeral`,
      text: String(count),
      pairId,
      type: 'numeral',
    });
  }

  if (Math.random() > 0.5) {
    const shapeKeys = ['circles', 'squares', 'triangles', 'stars'] as const;
    const shapeKey = shapeKeys[randInt(0, shapeKeys.length - 1)];
    const shapeEmoji = { circles: '🔵', squares: '🟥', triangles: '🔺', stars: '⭐' }[shapeKey];
    const pairId = 'shape-pair';
    pairs.push(
      {
        id: `${pairId}-shape`,
        text: shapeEmoji,
        pairId,
        type: 'shape',
      },
      {
        id: `${pairId}-name`,
        text: qs.shapes[shapeKey],
        pairId,
        type: 'name',
      },
    );
  }

  return pairs.sort(() => Math.random() - 0.5);
}

export const PRESCHOOL_MATCH_PAIRS = 3;

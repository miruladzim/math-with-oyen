import { describe, expect, it } from 'vitest';
import { buildPreschoolMatchDeck } from './preschoolMatch';
import { FORBIDDEN_EMOJI } from '../kidFriendlyEmojis';

describe('preschoolMatch', () => {
  it('builds emoji pairs without forbidden animals', () => {
    const deck = buildPreschoolMatchDeck('en');
    expect(deck.length).toBeGreaterThanOrEqual(6);
    for (const card of deck) {
      for (const emoji of FORBIDDEN_EMOJI) {
        expect(card.text).not.toContain(emoji);
      }
    }
  });
});

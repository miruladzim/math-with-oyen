import { describe, expect, it } from 'vitest';
import { COUNTING_EMOJI, FORBIDDEN_EMOJI, GARDEN_EMOJI, STICKER_EMOJI } from './kidFriendlyEmojis';

function assertPoolSafe(pool: readonly string[], name: string) {
  for (const emoji of pool) {
    expect(FORBIDDEN_EMOJI, `${name} must not include ${emoji}`).not.toContain(emoji);
  }
}

describe('kidFriendlyEmojis policy', () => {
  it('keeps counting, garden, and sticker pools free of dog/pig emoji', () => {
    assertPoolSafe(COUNTING_EMOJI, 'COUNTING_EMOJI');
    assertPoolSafe(GARDEN_EMOJI, 'GARDEN_EMOJI');
    assertPoolSafe(STICKER_EMOJI, 'STICKER_EMOJI');
  });
});

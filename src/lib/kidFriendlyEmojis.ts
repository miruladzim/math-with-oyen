/** Safe emoji pools for Muslim-friendly kids content (no dog or pig imagery). */

export const FORBIDDEN_EMOJI = ['🐶', '🐕', '🐩', '🐷', '🐖'] as const;

/** Objects and animals used in counting / compare visuals. */
export const COUNTING_EMOJI = ['⭐', '🍎', '🌸', '🎈', '🐰', '🐦', '🦋', '🐻', '🐟', '🌻'] as const;

export const STICKER_EMOJI = ['⭐', '🌸', '🦋', '🐰', '🐦', '🌻', '🎈', '✨', '🐻', '🐟'] as const;

export const GARDEN_EMOJI = ['🌸', '🦋', '🐞', '🌻', '🍄', '🐝', '🌷', '⭐'] as const;

export function pickRandomEmoji<T extends readonly string[]>(pool: T): T[number] {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function emojiRepeat(emoji: string, count: number): string {
  return Array(count).fill(emoji).join(' ');
}

import type { ReactNode } from 'react';
import { STICKER_EMOJI, pickRandomEmoji } from '../../lib/kidFriendlyEmojis';
import styles from './PreschoolVictory.module.css';

interface PreschoolVictoryProps {
  children: ReactNode;
  showStickers?: boolean;
}

export function PreschoolVictory({ children, showStickers = true }: PreschoolVictoryProps) {
  const stickers = showStickers
    ? Array.from({ length: 5 }, () => pickRandomEmoji(STICKER_EMOJI))
    : [];

  return (
    <div className={styles.wrap} data-preschool="true">
      {showStickers ? (
        <div className={styles.stickerBurst} aria-hidden="true">
          {stickers.map((emoji, index) => (
            <span
              key={`sticker-${index}-${emoji}`}
              className={styles.sticker}
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>
      ) : null}
      {children}
    </div>
  );
}

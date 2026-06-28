import { useLanguage } from '../context/LanguageContext';
import styles from './KidHint.module.css';

type HintVariant = 'tip' | 'howTo' | 'help' | 'encourage';
export type HintMood = 'idle' | 'happy' | 'encourage' | 'think';

interface KidHintProps {
  message: string;
  title?: string;
  variant?: HintVariant;
  mood?: HintMood;
  compact?: boolean;
  live?: 'polite' | 'assertive' | 'off';
}

const VARIANT_MOOD: Record<HintVariant, HintMood> = {
  tip: 'think',
  howTo: 'idle',
  help: 'encourage',
  encourage: 'happy',
};

const MOOD_EMOJI: Record<HintMood, string> = {
  idle: '🐱',
  happy: '😺',
  encourage: '🐱',
  think: '🐱',
};

const VARIANT_TITLE_KEY: Record<HintVariant, string> = {
  tip: 'hints.tipTitle',
  howTo: 'hints.howToTitle',
  help: 'hints.helpTitle',
  encourage: 'hints.catSays',
};

export function KidHint({
  message,
  title,
  variant = 'tip',
  mood,
  compact = false,
  live,
}: KidHintProps) {
  const { t } = useLanguage();
  const resolvedMood = mood ?? VARIANT_MOOD[variant];
  const catEmoji = MOOD_EMOJI[resolvedMood];
  const mascotName = t('hints.mascotName');
  const displayTitle =
    title ??
    (variant === 'encourage'
      ? t('hints.catSays', { name: mascotName })
      : t(VARIANT_TITLE_KEY[variant]));

  return (
    <div
      className={`${styles.hint} ${styles[variant]} ${styles[resolvedMood]} ${compact ? styles.compact : ''}`}
      role={live ? 'status' : 'note'}
      aria-live={live ?? undefined}
      aria-label={`${mascotName}: ${message}`}
    >
      <div className={styles.catWrap} aria-hidden="true">
        <span className={styles.cat}>{catEmoji}</span>
        {resolvedMood === 'think' ? <span className={styles.thought}>💭</span> : null}
      </div>
      <div className={styles.bubble}>
        <span className={styles.title}>{displayTitle}</span>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}

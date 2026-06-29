import styles from './OyenAvatar.module.css';

export type OyenMood = 'default' | 'happy';

interface OyenAvatarProps {
  mood?: OyenMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  title?: string;
}

const SIZE_CLASS = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
} as const;

/** Flat Oyen cat — same look on every device (no system emoji). */
export function OyenAvatar({
  mood = 'default',
  size = 'md',
  className = '',
  title = 'Oyen',
}: OyenAvatarProps) {
  const happy = mood === 'happy';

  return (
    <span
      className={`${styles.wrap} ${SIZE_CLASS[size]} ${className}`.trim()}
      role="img"
      aria-label={title}
    >
      <svg viewBox="0 0 64 64" className={styles.svg} aria-hidden="true">
        <path fill="#FFCC4D" d="M10 30 18 6 26 26Z" />
        <path fill="#FFCC4D" d="M38 26 46 6 54 30Z" />
        <path fill="#E69928" d="M14 26 18 14 22 26Z" />
        <path fill="#E69928" d="M42 26 46 14 50 26Z" />
        <circle cx="32" cy="36" r="23" fill="#FFCC4D" />
        {happy ? (
          <>
            <path
              stroke="#313131"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              d="M20 34q3-4 6 0"
            />
            <path
              stroke="#313131"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              d="M38 34q3-4 6 0"
            />
            <path
              stroke="#8B5A2B"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              d="M23 46q9 9 18 0"
            />
          </>
        ) : (
          <>
            <ellipse cx="23" cy="34" rx="3.2" ry="4.5" fill="#313131" />
            <ellipse cx="41" cy="34" rx="3.2" ry="4.5" fill="#313131" />
            <circle cx="24.2" cy="32.5" r="1" fill="#fff" opacity="0.75" />
            <circle cx="42.2" cy="32.5" r="1" fill="#fff" opacity="0.75" />
            <path fill="#E67533" d="M32 40 28 44h8Z" />
            <path
              stroke="#8B5A2B"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              d="M32 44v2"
            />
            <path
              stroke="#8B5A2B"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              d="M32 46q-5 3-8 1"
            />
            <path
              stroke="#8B5A2B"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              d="M32 46q5 3 8 1"
            />
          </>
        )}
        <path stroke="#E69928" strokeWidth="1.2" opacity="0.55" d="M12 36h10" />
        <path stroke="#E69928" strokeWidth="1.2" opacity="0.55" d="M42 36h10" />
        <path stroke="#E69928" strokeWidth="1.2" opacity="0.55" d="M11 40h9" />
        <path stroke="#E69928" strokeWidth="1.2" opacity="0.55" d="M44 40h9" />
      </svg>
    </span>
  );
}

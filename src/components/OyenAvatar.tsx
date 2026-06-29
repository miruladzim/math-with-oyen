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

/** Oyen — grinning gradient cat, same on every device. */
export function OyenAvatar({
  mood = 'default',
  size = 'md',
  className = '',
  title = 'Oyen',
}: OyenAvatarProps) {
  const extraHappy = mood === 'happy';

  return (
    <span
      className={`${styles.wrap} ${SIZE_CLASS[size]} ${className}`.trim()}
      role="img"
      aria-label={title}
    >
      <svg viewBox="0 0 64 64" className={styles.svg} aria-hidden="true">
        <defs>
          <linearGradient id="oyenFace" x1="32" y1="6" x2="32" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE566" />
            <stop offset="42%" stopColor="#FFB347" />
            <stop offset="100%" stopColor="#FF7B6B" />
          </linearGradient>
          <linearGradient id="oyenEar" x1="32" y1="6" x2="32" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE566" />
            <stop offset="100%" stopColor="#FFAA44" />
          </linearGradient>
        </defs>

        {/* Rounded square face + ears */}
        <path
          fill="url(#oyenFace)"
          d="M12 24 16 10 24 20 40 20 48 10 52 24 56 28 56 48 Q56 56 32 56 Q8 56 8 48 L8 28 Z"
        />
        <path fill="url(#oyenEar)" d="M14 22 17 12 23 19 Z" opacity="0.9" />
        <path fill="url(#oyenEar)" d="M41 19 47 12 50 22 Z" opacity="0.9" />

        {/* Eyes */}
        <circle cx="23" cy="30" r="2.6" fill="#4A2C12" />
        <circle cx="41" cy="30" r="2.6" fill="#4A2C12" />

        {/* Nose */}
        <ellipse cx="32" cy="35" rx="2.2" ry="1.6" fill="#F48FB1" />

        {/* Open grin */}
        <path
          fill="#6D1B4D"
          d={
            extraHappy
              ? 'M20 36 Q32 54 44 36 Q32 50 20 36 Z'
              : 'M22 37 Q32 50 42 37 Q32 46 22 37 Z'
          }
        />
        <path
          fill="#F48FB1"
          d={
            extraHappy
              ? 'M26 40 Q32 48 38 40 Q32 44 26 40 Z'
              : 'M27 40 Q32 46 37 40 Q32 43 27 40 Z'
          }
        />

        {/* Whiskers */}
        <path stroke="#E69545" strokeWidth="1.3" strokeLinecap="round" d="M8 30 H18" />
        <path stroke="#E69545" strokeWidth="1.3" strokeLinecap="round" d="M46 30 H56" />
        <path stroke="#E69545" strokeWidth="1.3" strokeLinecap="round" d="M7 35 H17" />
        <path stroke="#E69545" strokeWidth="1.3" strokeLinecap="round" d="M47 35 H57" />
        <path stroke="#E69545" strokeWidth="1.3" strokeLinecap="round" d="M8 40 H16" />
        <path stroke="#E69545" strokeWidth="1.3" strokeLinecap="round" d="M48 40 H56" />
      </svg>
    </span>
  );
}

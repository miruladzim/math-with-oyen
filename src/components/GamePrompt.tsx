import styles from './GamePrompt.module.css';

type PromptTheme = 'sky' | 'space' | 'ocean' | 'cave' | 'kitchen' | 'arcade';

interface GamePromptProps {
  icon: string;
  label: string;
  theme?: PromptTheme;
  /** Lab: show only the question text, no mode title row */
  variant?: 'full' | 'questionOnly';
  children: React.ReactNode;
}

export function GamePrompt({
  icon,
  label,
  theme = 'sky',
  variant = 'full',
  children,
}: GamePromptProps) {
  return (
    <div className={`${styles.card} ${styles[theme]} ${variant === 'questionOnly' ? styles.questionOnly : ''}`}>
      {variant === 'full' ? (
        <div className={styles.header}>
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
          <span className={styles.label}>{label}</span>
        </div>
      ) : null}
      <div className={styles.body}>{children}</div>
    </div>
  );
}

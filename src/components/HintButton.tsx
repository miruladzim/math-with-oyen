import { useLanguage } from '../context/LanguageContext';
import styles from './HintButton.module.css';

interface HintButtonProps {
  onClick: () => void;
  disabled?: boolean;
  compact?: boolean;
}

export function HintButton({ onClick, disabled, compact = false }: HintButtonProps) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className={`${styles.btn} ${compact ? styles.compact : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={t('hints.hintButtonAria')}
    >
      <span className={styles.label}>{t('hints.hintButton')}</span>
    </button>
  );
}

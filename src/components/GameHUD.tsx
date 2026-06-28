import { useLanguage } from '../context/LanguageContext';
import styles from './GameHUD.module.css';

interface GameHUDProps {
  icon?: string;
  label: string;
  current: number;
  total: number;
  score: number;
  combo?: number;
  extra?: string;
}

export function GameHUD({
  icon = '🎮',
  label,
  current,
  total,
  score,
  combo = 0,
  extra,
}: GameHUDProps) {
  const { t } = useLanguage();
  const pct = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={styles.hud}>
      <div className={styles.topRow}>
        <span className={styles.label}>
          <span className={styles.labelIcon} aria-hidden="true">
            {icon}
          </span>
          {label}
        </span>
        <div className={styles.badges}>
          {extra && <span className={styles.extra}>{extra}</span>}
          <span className={styles.score}>
            ⭐ {score}
          </span>
          {combo >= 2 && (
            <span className={styles.combo} aria-live="polite">
              🔥 {t('games.combo', { count: combo })}
            </span>
          )}
        </div>
      </div>
      <div className={styles.progressRow}>
        <span className={styles.progressText}>
          {current}/{total}
        </span>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${current}/${total}`}
        >
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

import { useLanguage } from '../../context/LanguageContext';
import type { ExamQuestion } from '../../lib/exam/examBuilder';
import { getExamSectionConfig } from '../../lib/exam/examConfig';
import styles from './ExamHUD.module.css';

interface ExamHUDProps {
  sectionIndex: number;
  questionIndex: number;
  totalQuestions: number;
  correctCount: number;
  answeredCount: number;
  hintAvailable: boolean;
  hintUsed: boolean;
  onUseHint: () => void;
  currentQuestion?: ExamQuestion;
}

export function ExamHUD({
  sectionIndex,
  questionIndex,
  totalQuestions,
  correctCount,
  answeredCount,
  hintAvailable,
  hintUsed,
  onUseHint,
}: ExamHUDProps) {
  const { t } = useLanguage();
  const section = getExamSectionConfig(sectionIndex);

  return (
    <header className={`${styles.hud} ${styles[`theme_${section.themeClass}`]}`}>
      <div className={styles.topRow}>
        <div className={styles.sectionInfo}>
          <span className={styles.sectionLabel}>{t(section.labelKey)}</span>
          <span className={styles.difficultyBadge}>
            {t('exam.difficultyLabel', { level: section.difficulty })}
          </span>
        </div>
        <p className={styles.score} aria-live="polite">
          {t('exam.liveScore', { correct: correctCount, answered: answeredCount })}
        </p>
      </div>

      <div
        className={styles.journeyRail}
        role="progressbar"
        aria-valuenow={questionIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalQuestions}
        aria-label={t('exam.journeyAria')}
      >
        {Array.from({ length: totalQuestions }, (_, i) => {
          const sectionForDot = Math.floor(i / 5);
          return (
            <span
              key={i}
              className={[
                styles.dot,
                sectionForDot === sectionIndex ? styles.dotActiveSection : '',
                i < questionIndex ? styles.dotDone : '',
                i === questionIndex ? styles.dotCurrent : '',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          );
        })}
      </div>

      {hintAvailable ? (
        <button
          type="button"
          className={`${styles.hintPower} ${hintUsed ? styles.hintUsed : ''}`}
          onClick={onUseHint}
          disabled={hintUsed}
        >
          {hintUsed ? t('exam.hintUsed') : t('exam.hintPowerUp')}
        </button>
      ) : null}
    </header>
  );
}

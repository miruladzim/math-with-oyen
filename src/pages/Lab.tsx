import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { KidHint } from '../components/KidHint';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { getLabModesForGrade, VALID_LAB_MODES } from '../lib/lab/labConfig';
import type { LabModeId } from '../lib/types';
import { PatternStudio } from '../lab/modes/PatternStudio/PatternStudio';
import { SortSquad } from '../lab/modes/SortSquad/SortSquad';
import { NumberLineJump } from '../lab/modes/NumberLineJump/NumberLineJump';
import { EquationBuilder } from '../lab/modes/EquationBuilder/EquationBuilder';
import { BalanceScale } from '../lab/modes/BalanceScale/BalanceScale';
import { ThinkSteps } from '../lab/modes/ThinkSteps/ThinkSteps';
import styles from './Lab.module.css';

const THEME_CLASS: Record<string, string> = {
  studio: styles.studioTheme,
  path: styles.pathTheme,
  workshop: styles.workshopTheme,
  scale: styles.scaleTheme,
  sort: styles.sortTheme,
  steps: styles.stepsTheme,
};

export function Lab() {
  const { t } = useLanguage();
  const { gradeLevel } = useProgress();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeMode, setActiveMode] = useState<LabModeId | null>(null);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode && VALID_LAB_MODES.includes(mode as LabModeId)) {
      setActiveMode(mode as LabModeId);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const exitMode = () => setActiveMode(null);
  const modes = getLabModesForGrade(gradeLevel);

  if (activeMode === 'patternStudio') {
    return (
      <div className={styles.modeArea}>
        <PatternStudio onExit={exitMode} />
      </div>
    );
  }
  if (activeMode === 'sortSquad') {
    return (
      <div className={styles.modeArea}>
        <SortSquad onExit={exitMode} />
      </div>
    );
  }
  if (activeMode === 'numberLine') {
    return (
      <div className={styles.modeArea}>
        <NumberLineJump onExit={exitMode} />
      </div>
    );
  }
  if (activeMode === 'equationBuilder') {
    return (
      <div className={styles.modeArea}>
        <EquationBuilder onExit={exitMode} />
      </div>
    );
  }
  if (activeMode === 'balanceScale') {
    return (
      <div className={styles.modeArea}>
        <BalanceScale onExit={exitMode} />
      </div>
    );
  }
  if (activeMode === 'thinkSteps') {
    return (
      <div className={styles.modeArea}>
        <ThinkSteps onExit={exitMode} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('lab.hubTitle')}</h1>
        <p className={styles.subtitle}>{t('lab.hubSubtitle')}</p>
      </div>

      <KidHint variant="howTo" message={t('lab.hubSubtitle')} />

      <div className={styles.modeGrid}>
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`${styles.modeCard} ${THEME_CLASS[mode.theme] ?? ''}`}
            onClick={() => setActiveMode(mode.id)}
          >
            <span className={styles.modeArt} aria-hidden="true">
              {mode.emoji}
            </span>
            <div className={styles.modeInfo}>
              <h3>{t(`lab.modes.${mode.id}.title`)}</h3>
              <p>{t(`lab.modes.${mode.id}.desc`)}</p>
              <p className={styles.learning}>{t(`lab.modes.${mode.id}.learning`)}</p>
            </div>
            <span className={styles.playBadge}>▶️ {t('lab.play')}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FadeView } from '../components/FadeView';
import { BackButton } from '../components/BackButton';
import { KidHint } from '../components/KidHint';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { usePlaySessionAudio } from '../hooks/usePlaySessionAudio';
import { isPreschool } from '../lib/preschoolConfig';
import { PreschoolShell } from '../components/preschool/PreschoolShell';
import { getLabModesForGrade } from '../lib/lab/labConfig';
import type { LabModeId } from '../lib/types';
import { CompareCove } from '../lab/modes/CompareCove/CompareCove';
import { ShapeMatch } from '../lab/modes/ShapeMatch/ShapeMatch';
import { StoryWalk } from '../lab/modes/StoryWalk/StoryWalk';
import { NumberTrace } from '../lab/modes/NumberTrace/NumberTrace';
import { PuzzlePatch } from '../lab/modes/PuzzlePatch/PuzzlePatch';
import { PatternStudio } from '../lab/modes/PatternStudio/PatternStudio';
import { SortSquad } from '../lab/modes/SortSquad/SortSquad';
import { NumberLineJump } from '../lab/modes/NumberLineJump/NumberLineJump';
import { EquationBuilder } from '../lab/modes/EquationBuilder/EquationBuilder';
import { BalanceScale } from '../lab/modes/BalanceScale/BalanceScale';
import { TapGarden } from '../lab/modes/TapGarden/TapGarden';
import { ThinkSteps } from '../lab/modes/ThinkSteps/ThinkSteps';
import styles from './Lab.module.css';

const THEME_CLASS: Record<string, string> = {
  studio: styles.studioTheme,
  path: styles.pathTheme,
  workshop: styles.workshopTheme,
  scale: styles.scaleTheme,
  sort: styles.sortTheme,
  steps: styles.stepsTheme,
  garden: styles.gardenTheme,
  cove: styles.coveTheme,
  match: styles.matchTheme,
  story: styles.storyTheme,
  trace: styles.traceTheme,
  puzzle: styles.puzzleTheme,
};

export function Lab() {
  const { t } = useLanguage();
  const { gradeLevel } = useProgress();
  const preschoolMode = isPreschool(gradeLevel);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeMode, setActiveMode] = useState<LabModeId | null>(null);

  usePlaySessionAudio(activeMode ? 'lab' : null);

  useEffect(() => {
    const mode = searchParams.get('mode');
    const allowedModes = getLabModesForGrade(gradeLevel).map((entry) => entry.id);
    if (mode && allowedModes.includes(mode as LabModeId)) {
      setActiveMode(mode as LabModeId);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, gradeLevel]);

  const exitMode = () => setActiveMode(null);
  const modes = getLabModesForGrade(gradeLevel);

  let content: ReactNode;

  if (activeMode === 'tapGarden') {
    content = (
      <div className={styles.modeArea}>
        <TapGarden onExit={exitMode} />
      </div>
    );
  } else if (activeMode === 'compareCove') {
    content = (
      <div className={styles.modeArea}>
        <CompareCove onExit={exitMode} />
      </div>
    );
  } else if (activeMode === 'shapeMatch') {
    content = (
      <div className={styles.modeArea}>
        <ShapeMatch onExit={exitMode} />
      </div>
    );
  } else if (activeMode === 'storyWalk') {
    content = (
      <div className={styles.modeArea}>
        <StoryWalk onExit={exitMode} />
      </div>
    );
  } else if (activeMode === 'numberTrace') {
    content = (
      <div className={styles.modeArea}>
        <NumberTrace onExit={exitMode} />
      </div>
    );
  } else if (activeMode === 'puzzlePatch') {
    content = (
      <div className={styles.modeArea}>
        <PuzzlePatch onExit={exitMode} />
      </div>
    );
  } else if (activeMode === 'patternStudio') {
    content = (
      <div className={styles.modeArea}>
        <PatternStudio onExit={exitMode} />
      </div>
    );
  } else if (activeMode === 'sortSquad') {
    content = (
      <div className={styles.modeArea}>
        <SortSquad onExit={exitMode} />
      </div>
    );
  } else if (activeMode === 'numberLine') {
    content = (
      <div className={styles.modeArea}>
        <NumberLineJump onExit={exitMode} />
      </div>
    );
  } else if (activeMode === 'equationBuilder') {
    content = (
      <div className={styles.modeArea}>
        <EquationBuilder onExit={exitMode} />
      </div>
    );
  } else if (activeMode === 'balanceScale') {
    content = (
      <div className={styles.modeArea}>
        <BalanceScale onExit={exitMode} />
      </div>
    );
  } else if (activeMode === 'thinkSteps') {
    content = (
      <div className={styles.modeArea}>
        <ThinkSteps onExit={exitMode} />
      </div>
    );
  } else {
    const hub = (
      <div className={styles.page}>
        <BackButton label={t('practice.backHome')} to="/" />
        <div className={styles.header}>
          <h1 className={styles.title}>{t('lab.hubTitle')}</h1>
          <p className={styles.subtitle}>
            {preschoolMode ? t('home.labDescPreschool') : t('lab.hubSubtitle')}
          </p>
        </div>

        <KidHint
          variant="howTo"
          message={preschoolMode ? t('preschool.labBanner') : t('lab.hubSubtitle')}
        />

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
    content = preschoolMode ? (
      <PreschoolShell banner={t('preschool.labBanner')}>{hub}</PreschoolShell>
    ) : (
      hub
    );
  }

  return (
    <FadeView viewKey={activeMode ?? 'hub'} scrollTopOnEnter>
      {content}
    </FadeView>
  );
}

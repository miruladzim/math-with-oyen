import { useEffect, useMemo, useState } from 'react';
import { PreschoolVictoryScreen } from '../../../components/preschool/PreschoolVictoryScreen';
import { useLanguage } from '../../../context/LanguageContext';
import { useProgress } from '../../../context/ProgressContext';
import { useLabSession } from '../../../hooks/useLabSession';
import { buildShapeMatchChallenge } from '../../../lib/lab/challenges';
import { getLabModeMeta } from '../../../lib/lab/labConfig';
import { playPop } from '../../../lib/audio';
import { LabShell } from '../../LabShell';
import styles from './ShapeMatch.module.css';

interface ShapeMatchProps {
  onExit: () => void;
}

export function ShapeMatch({ onExit }: ShapeMatchProps) {
  const { progress, setProgress } = useProgress();
  const { t, language } = useLanguage();
  const meta = getLabModeMeta('shapeMatch');
  const session = useLabSession({ modeId: 'shapeMatch', progress, setProgress });
  const [mistakeIdx, setMistakeIdx] = useState(0);

  const challenge = useMemo(
    () => buildShapeMatchChallenge(session.roundDifficulty, language, session.round),
    [language, session.round, session.roundDifficulty],
  );

  useEffect(() => {
    setMistakeIdx(0);
  }, [challenge.id]);

  const pickBin = (binId: string) => {
    if (session.locked) return;
    playPop();
    if (binId === challenge.correctBinId) {
      session.handleCorrect(t('common.match'), challenge.explanation);
    } else {
      session.handleWrong(
        t('preschool.matchTryAgain'),
        challenge.mistakeHints[mistakeIdx % challenge.mistakeHints.length],
      );
      setMistakeIdx((i) => i + 1);
    }
  };

  if (session.done) {
    return (
      <PreschoolVictoryScreen
        title={t('practice.sessionComplete')}
        subtitle={t('lab.victorySub', { correct: session.correct, total: session.rounds })}
        encouragement={t(`victory.${session.encouragementKey}`)}
        stars={session.stars}
        onPlayAgain={session.restart}
        onExit={onExit}
        backLabel={t('lab.backLab')}
      />
    );
  }

  return (
    <LabShell
      modeId="shapeMatch"
      emoji={meta.emoji}
      title={t('lab.modes.shapeMatch.title')}
      theme={meta.theme}
      round={session.round}
      rounds={session.rounds}
      score={session.correct}
      combo={session.combo}
      feedback={session.feedback}
      mistakeAlert={session.mistakeAlert}
      wrongHelp={session.wrongHelp}
      challenge={challenge}
      onExit={onExit}
      onDismissFeedback={session.dismissFeedbackPopup}
      confettiKey={session.confetti.burstKey}
    >
      <div className={styles.stage}>
        <div className={styles.shapeCard} aria-hidden="true">
          {challenge.shapeEmoji}
        </div>
        <p className={styles.hint}>{t('lab.modes.shapeMatch.pickBin')}</p>
        <div className={styles.bins}>
          {challenge.bins.map((bin) => (
            <button
              key={bin.id}
              type="button"
              className={styles.bin}
              onClick={() => pickBin(bin.id)}
              disabled={session.locked}
            >
              {bin.label}
            </button>
          ))}
        </div>
      </div>
    </LabShell>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { PreschoolVictoryScreen } from '../../../components/preschool/PreschoolVictoryScreen';
import { useLanguage } from '../../../context/LanguageContext';
import { useProgress } from '../../../context/ProgressContext';
import { useLabSession } from '../../../hooks/useLabSession';
import { buildPuzzlePatchChallenge } from '../../../lib/lab/challenges';
import { getLabModeMeta } from '../../../lib/lab/labConfig';
import { playPop } from '../../../lib/audio';
import { LabShell } from '../../LabShell';
import styles from './PuzzlePatch.module.css';

interface PuzzlePatchProps {
  onExit: () => void;
}

export function PuzzlePatch({ onExit }: PuzzlePatchProps) {
  const { progress, setProgress } = useProgress();
  const { t, language } = useLanguage();
  const meta = getLabModeMeta('puzzlePatch');
  const session = useLabSession({ modeId: 'puzzlePatch', progress, setProgress });
  const [mistakeIdx, setMistakeIdx] = useState(0);

  const challenge = useMemo(
    () => buildPuzzlePatchChallenge(session.roundDifficulty, language, session.round),
    [language, session.round, session.roundDifficulty],
  );

  useEffect(() => {
    setMistakeIdx(0);
  }, [challenge.id]);

  const pickPiece = (piece: string) => {
    if (session.locked) return;
    playPop();
    if (piece === challenge.correctPiece) {
      session.handleCorrect(t('common.correct'), challenge.explanation);
    } else {
      session.handleWrong(
        t('preschool.tryAgain'),
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
      modeId="puzzlePatch"
      emoji={meta.emoji}
      title={t('lab.modes.puzzlePatch.title')}
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
        <p className={styles.hint}>{t('preschool.pickMissingPiece')}</p>
        <div className={styles.grid} aria-hidden="true">
          {challenge.grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isGap = rowIndex === challenge.missingRow && colIndex === challenge.missingCol;
              return (
                <span
                  key={`${challenge.id}-${rowIndex}-${colIndex}`}
                  className={`${styles.cell} ${isGap ? styles.gap : ''}`}
                >
                  {isGap ? '?' : cell}
                </span>
              );
            }),
          )}
        </div>
        <div className={styles.choices}>
          {challenge.pieceOptions.map((piece) => (
            <button
              key={`${challenge.id}-piece-${piece}`}
              type="button"
              className={styles.choice}
              onClick={() => pickPiece(piece)}
              disabled={session.locked}
            >
              {piece}
            </button>
          ))}
        </div>
      </div>
    </LabShell>
  );
}

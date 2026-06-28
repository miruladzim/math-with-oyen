import { useEffect, useMemo, useState } from 'react';
import { BigButton } from '../../../components/BigButton';
import { PreschoolVictoryScreen } from '../../../components/preschool/PreschoolVictoryScreen';
import { VictoryScreen } from '../../../components/VictoryScreen';
import { useLanguage } from '../../../context/LanguageContext';
import { useProgress } from '../../../context/ProgressContext';
import { useLabSession } from '../../../hooks/useLabSession';
import { buildPatternStudioChallenge } from '../../../lib/lab/challenges';
import { getLabModeMeta } from '../../../lib/lab/labConfig';
import { LabShell } from '../../LabShell';
import { DragTile } from '../../components/DragTile';
import { DropZone } from '../../components/DropZone';
import stage from '../../labStage.module.css';
import styles from './PatternStudio.module.css';

interface PatternStudioProps {
  onExit: () => void;
}

export function PatternStudio({ onExit }: PatternStudioProps) {
  const { progress, setProgress, gradeLevel } = useProgress();
  const { t, language } = useLanguage();
  const meta = getLabModeMeta('patternStudio');
  const preschool = gradeLevel === 'preschool';
  const session = useLabSession({ modeId: 'patternStudio', progress, setProgress });
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<string | null>(null);
  const [mistakeIdx, setMistakeIdx] = useState(0);

  const challenge = useMemo(
    () => buildPatternStudioChallenge(session.roundDifficulty, language, session.round, preschool),
    [language, preschool, session.round, session.roundDifficulty],
  );

  useEffect(() => {
    setSelected(null);
    setPlaced(null);
    setMistakeIdx(0);
  }, [challenge.id]);

  const placeTile = () => {
    if (!selected || session.locked) return;
    setPlaced(selected);
    setSelected(null);
  };

  const onCheck = () => {
    const answer = selected ?? placed;
    if (!answer || session.locked) return;
    if (answer === challenge.correctAnswer) {
      session.handleCorrect(t('common.correct'), challenge.explanation);
    } else {
      session.handleWrong(
        t('common.notQuite'),
        challenge.mistakeHints[mistakeIdx % challenge.mistakeHints.length],
      );
      setMistakeIdx((i) => i + 1);
      setPlaced(null);
      setSelected(null);
    }
  };

  if (session.done) {
    const victoryProps = {
      title: t('practice.sessionComplete'),
      subtitle: t('lab.victorySub', { correct: session.correct, total: session.rounds }),
      encouragement: t(`victory.${session.encouragementKey}`),
      stars: session.stars,
      onPlayAgain: session.restart,
      onExit,
      backLabel: t('lab.backLab'),
    };
    return preschool ? (
      <PreschoolVictoryScreen {...victoryProps} />
    ) : (
      <VictoryScreen {...victoryProps} />
    );
  }

  return (
    <LabShell
      modeId="patternStudio"
      emoji={meta.emoji}
      title={t('lab.modes.patternStudio.title')}
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
      <div className={stage.stage}>
        <div className={styles.sequence}>
          {challenge.sequence.map((item, index) =>
            item === '?' ? (
              <DropZone
                key={`gap-${index}`}
                filled={placed}
                active={!!selected}
                onDrop={placeTile}
                large
              />
            ) : (
              <span key={`${item}-${index}`} className={styles.item}>
                {item}
              </span>
            ),
          )}
        </div>
        <div className={stage.bank}>
          {challenge.tileOptions.map((tile, tileIndex) => (
            <DragTile
              key={`${tile}-${tileIndex}`}
              label={tile}
              selected={selected === tile}
              disabled={session.locked}
              onSelect={() => {
                const next = selected === tile ? null : tile;
                setSelected(next);
                if (next !== null) setPlaced(null);
              }}
            />
          ))}
        </div>
        <div className={stage.actions}>
          <BigButton onClick={onCheck} disabled={session.locked || (!placed && !selected)}>
            {t('lab.check')}
          </BigButton>
        </div>
      </div>
    </LabShell>
  );
}

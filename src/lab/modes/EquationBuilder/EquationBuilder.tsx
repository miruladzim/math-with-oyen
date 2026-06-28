import { useEffect, useMemo, useState } from 'react';
import { BigButton } from '../../../components/BigButton';
import { VictoryScreen } from '../../../components/VictoryScreen';
import { useLanguage } from '../../../context/LanguageContext';
import { useProgress } from '../../../context/ProgressContext';
import { useLabSession } from '../../../hooks/useLabSession';
import { buildEquationBuilderChallenge } from '../../../lib/lab/challenges';
import { getLabModeMeta } from '../../../lib/lab/labConfig';
import { LabShell } from '../../LabShell';
import { DragTile } from '../../components/DragTile';
import { DropZone } from '../../components/DropZone';
import stage from '../../labStage.module.css';
import styles from './EquationBuilder.module.css';

interface EquationBuilderProps {
  onExit: () => void;
}

export function EquationBuilder({ onExit }: EquationBuilderProps) {
  const { progress, setProgress } = useProgress();
  const { t, language } = useLanguage();
  const meta = getLabModeMeta('equationBuilder');
  const session = useLabSession({ modeId: 'equationBuilder', progress, setProgress });
  const [selected, setSelected] = useState<number | null>(null);
  const [placed, setPlaced] = useState<number | null>(null);
  const [mistakeIdx, setMistakeIdx] = useState(0);

  const challenge = useMemo(
    () => buildEquationBuilderChallenge(session.roundDifficulty, language, session.round),
    [language, session.round, session.roundDifficulty],
  );

  useEffect(() => {
    setSelected(null);
    setPlaced(null);
    setMistakeIdx(0);
  }, [challenge.id]);

  const placeTile = () => {
    if (selected === null || session.locked) return;
    setPlaced(selected);
    setSelected(null);
  };

  const onCheck = () => {
    const value = selected ?? placed;
    if (value === null || session.locked) return;
    if (value === challenge.correctTile) {
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
    return (
      <VictoryScreen
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
      modeId="equationBuilder"
      emoji={meta.emoji}
      title={t('lab.modes.equationBuilder.title')}
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
        <div className={styles.equation}>
          <DropZone
            filled={placed !== null ? String(placed) : null}
            active={selected !== null}
            onDrop={placeTile}
            large
          />
          <span>+ {challenge.leftB} = {challenge.result}</span>
        </div>
        <div className={stage.bank}>
          {challenge.tiles.map((tile) => (
            <DragTile
              key={tile}
              label={String(tile)}
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
          <BigButton onClick={onCheck} disabled={session.locked || (placed === null && selected === null)}>
            {t('lab.check')}
          </BigButton>
        </div>
      </div>
    </LabShell>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { BigButton } from '../../../components/BigButton';
import { VictoryScreen } from '../../../components/VictoryScreen';
import { useLanguage } from '../../../context/LanguageContext';
import { useProgress } from '../../../context/ProgressContext';
import { useLabSession } from '../../../hooks/useLabSession';
import { buildNumberLineChallenge } from '../../../lib/lab/challenges';
import { getLabModeMeta } from '../../../lib/lab/labConfig';
import { LabShell } from '../../LabShell';
import stage from '../../labStage.module.css';
import styles from './NumberLineJump.module.css';

interface NumberLineJumpProps {
  onExit: () => void;
}

export function NumberLineJump({ onExit }: NumberLineJumpProps) {
  const { progress, setProgress, gradeLevel } = useProgress();
  const { t, language } = useLanguage();
  const meta = getLabModeMeta('numberLine');
  const preschool = gradeLevel === 'preschool';
  const session = useLabSession({ modeId: 'numberLine', progress, setProgress });
  const [position, setPosition] = useState(0);
  const [mistakeIdx, setMistakeIdx] = useState(0);

  const challenge = useMemo(
    () => buildNumberLineChallenge(session.roundDifficulty, language, session.round, preschool),
    [language, session.round, session.roundDifficulty],
  );

  const ticks = useMemo(() => {
    const list: number[] = [];
    for (let n = challenge.min; n <= challenge.max; n += 1) list.push(n);
    return list;
  }, [challenge.min, challenge.max]);

  useEffect(() => {
    setPosition(challenge.start);
    setMistakeIdx(0);
  }, [challenge.id, challenge.start]);

  const onCheck = () => {
    if (session.locked) return;
    if (position === challenge.target) {
      session.handleCorrect(t('common.correct'), challenge.explanation);
    } else {
      session.handleWrong(
        t('common.notQuite'),
        challenge.mistakeHints[mistakeIdx % challenge.mistakeHints.length],
      );
      setMistakeIdx((i) => i + 1);
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

  const pct = (value: number) =>
    `${((value - challenge.min) / Math.max(1, challenge.max - challenge.min)) * 100}%`;

  return (
    <LabShell
      modeId="numberLine"
      emoji={meta.emoji}
      title={t('lab.modes.numberLine.title')}
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
        <div className={styles.lineWrap}>
          <div className={styles.line} />
          <div className={styles.marker} style={{ left: pct(position) }} aria-hidden="true">
            🐾
          </div>
          <div className={styles.ticks}>
            {ticks.map((tick) => (
              <button
                key={tick}
                type="button"
                className={`${styles.tick} ${tick === position ? styles.tickActive : ''}`}
                style={{ left: pct(tick) }}
                onClick={() => !session.locked && setPosition(tick)}
                disabled={session.locked}
              >
                {tick}
              </button>
            ))}
          </div>
        </div>
        <div className={stage.actions}>
          <BigButton
            small
            variant="outline"
            onClick={() => setPosition((p) => Math.max(challenge.min, p - 1))}
            disabled={session.locked || position <= challenge.min}
          >
            −1
          </BigButton>
          <BigButton
            small
            variant="outline"
            onClick={() => setPosition((p) => Math.min(challenge.max, p + 1))}
            disabled={session.locked || position >= challenge.max}
          >
            +1
          </BigButton>
          <BigButton onClick={onCheck} disabled={session.locked}>
            {t('lab.check')}
          </BigButton>
        </div>
      </div>
    </LabShell>
  );
}

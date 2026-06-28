import { useEffect, useMemo, useState } from 'react';
import { BigButton } from '../../../components/BigButton';
import { VictoryScreen } from '../../../components/VictoryScreen';
import { useLanguage } from '../../../context/LanguageContext';
import { useProgress } from '../../../context/ProgressContext';
import { useLabSession } from '../../../hooks/useLabSession';
import { buildBalanceScaleChallenge } from '../../../lib/lab/challenges';
import { getLabModeMeta } from '../../../lib/lab/labConfig';
import { LabShell } from '../../LabShell';
import stage from '../../labStage.module.css';
import styles from './BalanceScale.module.css';

interface BalanceScaleProps {
  onExit: () => void;
}

export function BalanceScale({ onExit }: BalanceScaleProps) {
  const { progress, setProgress } = useProgress();
  const { t, language } = useLanguage();
  const meta = getLabModeMeta('balanceScale');
  const session = useLabSession({ modeId: 'balanceScale', progress, setProgress });
  const [leftTotal, setLeftTotal] = useState(0);
  const [rightTotal, setRightTotal] = useState(0);
  const [mistakeIdx, setMistakeIdx] = useState(0);

  const challenge = useMemo(
    () => buildBalanceScaleChallenge(session.roundDifficulty, language, session.round),
    [language, session.round, session.roundDifficulty],
  );

  useEffect(() => {
    setLeftTotal(0);
    setRightTotal(0);
    setMistakeIdx(0);
  }, [challenge.id]);

  const addBlock = (side: 'left' | 'right', value: number) => {
    if (session.locked) return;
    if (side === 'left') setLeftTotal((v) => v + value);
    else setRightTotal((v) => v + value);
  };

  const clearSide = (side: 'left' | 'right') => {
    if (session.locked) return;
    if (side === 'left') setLeftTotal(0);
    else setRightTotal(0);
  };

  const onCheck = () => {
    if (session.locked) return;
    if (leftTotal === challenge.targetLeft && rightTotal === challenge.targetRight) {
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

  return (
    <LabShell
      modeId="balanceScale"
      emoji={meta.emoji}
      title={t('lab.modes.balanceScale.title')}
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
        <div className={styles.scale}>
          <div className={styles.pan}>
            <div className={styles.panHead}>⚖️ {leftTotal}</div>
            <div className={styles.blocks}>
              {Array.from({ length: Math.min(leftTotal, 12) }).map((_, i) => (
                <span key={`l-${i}`} className={styles.block}>
                  🟦
                </span>
              ))}
            </div>
            <BigButton small variant="outline" onClick={() => clearSide('left')} disabled={session.locked || leftTotal === 0}>
              {t('lab.clear')}
            </BigButton>
          </div>
          <div className={styles.pan}>
            <div className={styles.panHead}>⚖️ {rightTotal}</div>
            <div className={styles.blocks}>
              {Array.from({ length: Math.min(rightTotal, 12) }).map((_, i) => (
                <span key={`r-${i}`} className={styles.block}>
                  🟩
                </span>
              ))}
            </div>
            <BigButton small variant="outline" onClick={() => clearSide('right')} disabled={session.locked || rightTotal === 0}>
              {t('lab.clear')}
            </BigButton>
          </div>
        </div>
        <div className={stage.bank}>
          {challenge.blockValues.map((value) => (
            <div key={value} className={styles.palette}>
              <span className={stage.label}>+{value}</span>
              <BigButton small onClick={() => addBlock('left', value)} disabled={session.locked}>
                ←
              </BigButton>
              <BigButton small onClick={() => addBlock('right', value)} disabled={session.locked}>
                →
              </BigButton>
            </div>
          ))}
        </div>
        <div className={stage.actions}>
          <BigButton onClick={onCheck} disabled={session.locked}>
            {t('lab.check')}
          </BigButton>
        </div>
      </div>
    </LabShell>
  );
}

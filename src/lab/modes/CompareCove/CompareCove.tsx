import { useEffect, useMemo, useState } from 'react';
import { PreschoolVictoryScreen } from '../../../components/preschool/PreschoolVictoryScreen';
import { useLanguage } from '../../../context/LanguageContext';
import { useProgress } from '../../../context/ProgressContext';
import { useLabSession } from '../../../hooks/useLabSession';
import { buildCompareCoveChallenge } from '../../../lib/lab/challenges';
import { getLabModeMeta } from '../../../lib/lab/labConfig';
import { playPop } from '../../../lib/audio';
import { emojiRepeat } from '../../../lib/kidFriendlyEmojis';
import { LabShell } from '../../LabShell';
import styles from './CompareCove.module.css';

interface CompareCoveProps {
  onExit: () => void;
}

export function CompareCove({ onExit }: CompareCoveProps) {
  const { progress, setProgress } = useProgress();
  const { t, language } = useLanguage();
  const meta = getLabModeMeta('compareCove');
  const session = useLabSession({ modeId: 'compareCove', progress, setProgress });
  const [mistakeIdx, setMistakeIdx] = useState(0);

  const challenge = useMemo(
    () => buildCompareCoveChallenge(session.roundDifficulty, language, session.round),
    [language, session.round, session.roundDifficulty],
  );

  useEffect(() => {
    setMistakeIdx(0);
  }, [challenge.id]);

  const pickGroup = (value: number) => {
    if (session.locked) return;
    playPop();
    if (value === challenge.correctAnswer) {
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
      modeId="compareCove"
      emoji={meta.emoji}
      title={t('lab.modes.compareCove.title')}
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
        <p className={styles.hint}>{t('preschool.tapBiggerGroup')}</p>
        <div className={styles.groups} role="group" aria-label={challenge.prompt}>
          <button
            type="button"
            className={styles.groupBtn}
            onClick={() => pickGroup(challenge.groupA)}
            disabled={session.locked}
          >
            <span className={styles.groupEmoji}>{emojiRepeat(challenge.emoji, challenge.groupA)}</span>
            <span className={styles.groupCount}>{challenge.groupA}</span>
          </button>
          <button
            type="button"
            className={styles.groupBtn}
            onClick={() => pickGroup(challenge.groupB)}
            disabled={session.locked}
          >
            <span className={styles.groupEmoji}>{emojiRepeat(challenge.emoji, challenge.groupB)}</span>
            <span className={styles.groupCount}>{challenge.groupB}</span>
          </button>
        </div>
      </div>
    </LabShell>
  );
}

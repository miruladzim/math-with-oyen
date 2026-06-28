import { useEffect, useMemo, useState } from 'react';
import { PreschoolVictoryScreen } from '../../../components/preschool/PreschoolVictoryScreen';
import { useLanguage } from '../../../context/LanguageContext';
import { useProgress } from '../../../context/ProgressContext';
import { useLabSession } from '../../../hooks/useLabSession';
import { buildTapGardenChallenge } from '../../../lib/lab/challenges';
import { getLabModeMeta } from '../../../lib/lab/labConfig';
import { playPop } from '../../../lib/audio';
import { LabShell } from '../../LabShell';
import styles from './TapGarden.module.css';

interface TapGardenProps {
  onExit: () => void;
}

export function TapGarden({ onExit }: TapGardenProps) {
  const { progress, setProgress } = useProgress();
  const { t, language } = useLanguage();
  const meta = getLabModeMeta('tapGarden');
  const session = useLabSession({ modeId: 'tapGarden', progress, setProgress });
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [mistakeIdx, setMistakeIdx] = useState(0);

  const challenge = useMemo(
    () => buildTapGardenChallenge(session.roundDifficulty, language, session.round),
    [language, session.round, session.roundDifficulty],
  );

  useEffect(() => {
    setTapped(new Set());
    setMistakeIdx(0);
  }, [challenge.id]);

  const toggleTap = (index: number) => {
    if (session.locked) return;
    playPop();
    setTapped((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const submitCount = (value: number) => {
    if (session.locked) return;
    if (value === challenge.correctCount) {
      session.handleCorrect(t('preschool.greatCount'), challenge.explanation);
    } else {
      session.handleWrong(
        t('preschool.tryAgain'),
        challenge.mistakeHints[mistakeIdx % challenge.mistakeHints.length],
      );
      setMistakeIdx((i) => i + 1);
      setTapped(new Set());
    }
  };

  if (session.done) {
    return (
      <PreschoolVictoryScreen
        title={t('preschool.gardenComplete')}
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
      modeId="tapGarden"
      emoji={meta.emoji}
      title={t('lab.modes.tapGarden.title')}
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
        <p className={styles.hint}>{t('preschool.tapEachOne')}</p>

        <div className={styles.counter} aria-live="polite">
          <span className={styles.counterNum}>{tapped.size}</span>
          <span className={styles.counterLabel}>{t('preschool.tapped')}</span>
        </div>

        <div className={styles.grid}>
          {challenge.items.map((emoji, index) => (
            <button
              key={`${challenge.id}-${index}`}
              type="button"
              className={`${styles.item} ${tapped.has(index) ? styles.itemTapped : ''}`}
              onClick={() => toggleTap(index)}
              disabled={session.locked}
              aria-pressed={tapped.has(index)}
            >
              {emoji}
            </button>
          ))}
        </div>

        <p className={styles.pick}>{t('preschool.pickNumber')}</p>
        <div className={styles.choices}>
          {challenge.choices.map((choice) => (
            <button
              key={`${challenge.id}-${choice}`}
              type="button"
              className={styles.choice}
              onClick={() => submitCount(choice)}
              disabled={session.locked}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    </LabShell>
  );
}

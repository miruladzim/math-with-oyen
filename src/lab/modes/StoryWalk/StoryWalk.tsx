import { useEffect, useMemo, useState } from 'react';
import { PreschoolVictoryScreen } from '../../../components/preschool/PreschoolVictoryScreen';
import { useLanguage } from '../../../context/LanguageContext';
import { useProgress } from '../../../context/ProgressContext';
import { useLabSession } from '../../../hooks/useLabSession';
import { buildStoryWalkChallenge } from '../../../lib/lab/challenges';
import { getLabModeMeta } from '../../../lib/lab/labConfig';
import { playPop } from '../../../lib/audio';
import { LabShell } from '../../LabShell';
import styles from './StoryWalk.module.css';

interface StoryWalkProps {
  onExit: () => void;
}

export function StoryWalk({ onExit }: StoryWalkProps) {
  const { progress, setProgress } = useProgress();
  const { t, language } = useLanguage();
  const meta = getLabModeMeta('storyWalk');
  const session = useLabSession({ modeId: 'storyWalk', progress, setProgress });
  const [beatIndex, setBeatIndex] = useState(0);
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [mistakeIdx, setMistakeIdx] = useState(0);

  const challenge = useMemo(
    () => buildStoryWalkChallenge(session.roundDifficulty, language, session.round),
    [language, session.round, session.roundDifficulty],
  );

  const beat = challenge.beats[beatIndex];

  useEffect(() => {
    setBeatIndex(0);
    setTapped(new Set());
    setMistakeIdx(0);
  }, [challenge.id]);

  useEffect(() => {
    setTapped(new Set());
  }, [beatIndex, challenge.id]);

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
    if (session.locked || !beat) return;
    if (value === beat.correctCount) {
      if (beatIndex + 1 >= challenge.beats.length) {
        session.handleCorrect(t('preschool.greatCount'), challenge.explanation);
      } else {
        playPop();
        setBeatIndex((i) => i + 1);
      }
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

  if (!beat) return null;

  return (
    <LabShell
      modeId="storyWalk"
      emoji={meta.emoji}
      title={t('lab.modes.storyWalk.title')}
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
        <div className={styles.beatDots} aria-hidden="true">
          {challenge.beats.map((_, index) => (
            <span
              key={`${challenge.id}-dot-${index}`}
              className={`${styles.beatDot} ${index <= beatIndex ? styles.beatDotActive : ''}`}
            />
          ))}
        </div>

        <p className={styles.storyText}>{beat.text}</p>

        <div className={styles.counter} aria-live="polite">
          <span className={styles.counterNum}>{tapped.size}</span>
          <span className={styles.counterLabel}>{t('preschool.tapped')}</span>
        </div>

        <p className={styles.hint}>{t('preschool.tapEachOne')}</p>

        <div className={styles.grid}>
          {beat.items.map((emoji, index) => (
            <button
              key={`${challenge.id}-${beatIndex}-${index}`}
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
          {beat.choices.map((choice) => (
            <button
              key={`${challenge.id}-${beatIndex}-${choice}`}
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

import { useEffect, useMemo, useState } from 'react';
import { NumberTraceCanvas } from '../../../components/preschool/NumberTraceCanvas';
import { PreschoolVictoryScreen } from '../../../components/preschool/PreschoolVictoryScreen';
import { useLanguage } from '../../../context/LanguageContext';
import { useProgress } from '../../../context/ProgressContext';
import { useLabSession } from '../../../hooks/useLabSession';
import { buildNumberTraceChallenge } from '../../../lib/lab/challenges';
import { getLabModeMeta } from '../../../lib/lab/labConfig';
import { LabShell } from '../../LabShell';

interface NumberTraceProps {
  onExit: () => void;
}

export function NumberTrace({ onExit }: NumberTraceProps) {
  const { progress, setProgress } = useProgress();
  const { t, language } = useLanguage();
  const meta = getLabModeMeta('numberTrace');
  const session = useLabSession({ modeId: 'numberTrace', progress, setProgress });
  const [nextDot, setNextDot] = useState(0);
  const [mistakeIdx, setMistakeIdx] = useState(0);

  const challenge = useMemo(
    () => buildNumberTraceChallenge(session.roundDifficulty, language, session.round),
    [language, session.round, session.roundDifficulty],
  );

  useEffect(() => {
    setNextDot(0);
    setMistakeIdx(0);
  }, [challenge.id]);

  const tapDot = (index: number) => {
    if (session.locked) return;
    if (index === nextDot) {
      const completed = index + 1 >= challenge.dots.length;
      if (completed) {
        session.handleCorrect(t('preschool.greatCount'), challenge.explanation);
      } else {
        setNextDot(index + 1);
      }
    } else {
      session.handleWrong(
        t('preschool.tryAgain'),
        challenge.mistakeHints[mistakeIdx % challenge.mistakeHints.length],
      );
      setMistakeIdx((i) => i + 1);
      setNextDot(0);
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
      modeId="numberTrace"
      emoji={meta.emoji}
      title={t('lab.modes.numberTrace.title')}
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
      <NumberTraceCanvas
        digit={challenge.digit}
        dots={challenge.dots}
        nextDot={nextDot}
        disabled={session.locked}
        onTapDot={tapDot}
        hint={t('lab.modes.numberTrace.traceHint', { digit: challenge.digit })}
        ariaLabel={t('lab.modes.numberTrace.prompt', { digit: challenge.digit })}
      />
    </LabShell>
  );
}

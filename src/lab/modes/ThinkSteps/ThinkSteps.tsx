import { useEffect, useMemo, useState } from 'react';
import { BigButton } from '../../../components/BigButton';
import { VictoryScreen } from '../../../components/VictoryScreen';
import { useLanguage } from '../../../context/LanguageContext';
import { useProgress } from '../../../context/ProgressContext';
import { useLabSession } from '../../../hooks/useLabSession';
import { buildThinkStepsChallenge } from '../../../lib/lab/challenges';
import { getLabModeMeta } from '../../../lib/lab/labConfig';
import { LabShell } from '../../LabShell';
import stage from '../../labStage.module.css';
import styles from './ThinkSteps.module.css';

interface ThinkStepsProps {
  onExit: () => void;
}

type WizardStep = 1 | 2 | 3;

export function ThinkSteps({ onExit }: ThinkStepsProps) {
  const { progress, setProgress, gradeLevel } = useProgress();
  const { t, language } = useLanguage();
  const meta = getLabModeMeta('thinkSteps');
  const session = useLabSession({ modeId: 'thinkSteps', progress, setProgress });
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [answer, setAnswer] = useState('');
  const [mistakeIdx, setMistakeIdx] = useState(0);

  const challenge = useMemo(
    () => buildThinkStepsChallenge(session.roundDifficulty, language, gradeLevel, session.round),
    [language, gradeLevel, session.round, session.roundDifficulty],
  );

  const storyParts = useMemo(() => challenge.story.split(/(\d+)/), [challenge.story]);

  useEffect(() => {
    setWizardStep(1);
    setPickedIndices([]);
    setAnswer('');
    setMistakeIdx(0);
  }, [challenge.id]);

  const toggleNumberAt = (partIndex: number) => {
    if (session.locked || wizardStep !== 1) return;
    setPickedIndices((prev) =>
      prev.includes(partIndex)
        ? prev.filter((i) => i !== partIndex)
        : prev.length >= 2
          ? prev
          : [...prev, partIndex],
    );
  };

  const confirmStep1 = () => {
    const picked = pickedIndices.map((i) => Number(storyParts[i]));
    const sorted = [...picked].sort((a, b) => a - b);
    const expected = [...challenge.numbers].sort((a, b) => a - b);
    if (picked.length === 2 && sorted[0] === expected[0] && sorted[1] === expected[1]) {
      setWizardStep(2);
    } else {
      session.handleWrong(
        t('common.notQuite'),
        challenge.mistakeHints[mistakeIdx % challenge.mistakeHints.length],
      );
      setMistakeIdx((i) => i + 1);
    }
  };

  const pickOperation = (op: 'add' | 'sub' | 'mult') => {
    if (session.locked || wizardStep !== 2) return;
    if (op === challenge.operation) setWizardStep(3);
    else {
      session.handleWrong(
        t('common.notQuite'),
        challenge.mistakeHints[mistakeIdx % challenge.mistakeHints.length],
      );
      setMistakeIdx((i) => i + 1);
    }
  };

  const onSubmitAnswer = () => {
    if (session.locked || wizardStep !== 3) return;
    const value = Number(answer);
    if (value === challenge.correctAnswer) {
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
      modeId="thinkSteps"
      emoji={meta.emoji}
      title={t('lab.modes.thinkSteps.title')}
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
        <div className={styles.stepper}>
          {[1, 2, 3].map((step) => (
            <span key={step} className={`${styles.stepDot} ${wizardStep >= step ? styles.stepActive : ''}`}>
              {step}
            </span>
          ))}
        </div>
        <p className={styles.story}>
          {storyParts.map((part, index) => {
            const num = Number(part);
            if (!Number.isNaN(num) && part.trim() !== '') {
              const picked = pickedIndices.includes(index);
              return (
                <button
                  key={`${part}-${index}`}
                  type="button"
                  className={`${styles.numBtn} ${picked ? styles.numPicked : ''}`}
                  onClick={() => toggleNumberAt(index)}
                  disabled={wizardStep !== 1 || session.locked}
                >
                  {part}
                </button>
              );
            }
            return <span key={`${part}-${index}`}>{part}</span>;
          })}
        </p>
        {wizardStep === 1 ? (
          <div className={stage.actions}>
            <p className={stage.label}>{t('lab.modes.thinkSteps.step1')}</p>
            <BigButton onClick={confirmStep1} disabled={session.locked || pickedIndices.length < 2}>
              {t('lab.check')}
            </BigButton>
          </div>
        ) : null}
        {wizardStep === 2 ? (
          <div className={stage.actions}>
            <p className={stage.label}>{t('lab.modes.thinkSteps.step2')}</p>
            <BigButton variant="outline" onClick={() => pickOperation('add')} disabled={session.locked}>
              ➕ {t('lab.modes.thinkSteps.opAdd')}
            </BigButton>
            <BigButton variant="outline" onClick={() => pickOperation('sub')} disabled={session.locked}>
              ➖ {t('lab.modes.thinkSteps.opSub')}
            </BigButton>
            <BigButton variant="outline" onClick={() => pickOperation('mult')} disabled={session.locked}>
              ✖️ {t('lab.modes.thinkSteps.opMult')}
            </BigButton>
          </div>
        ) : null}
        {wizardStep === 3 ? (
          <div className={stage.actions}>
            <p className={stage.label}>{t('lab.modes.thinkSteps.step3')}</p>
            <input
              className={styles.input}
              type="number"
              inputMode="numeric"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={session.locked}
              aria-label={t('common.yourAnswer')}
            />
            <BigButton onClick={onSubmitAnswer} disabled={session.locked || answer.trim() === ''}>
              {t('lab.submit')}
            </BigButton>
          </div>
        ) : null}
      </div>
    </LabShell>
  );
}

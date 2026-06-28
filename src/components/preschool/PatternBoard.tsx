import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { playCorrect, playPop } from '../../lib/audio';
import { parsePatternSequence } from '../../lib/questions/preschoolVisual';
import type { Question } from '../../lib/types';
import styles from './TapToCountBoard.module.css';
import patternStyles from './PatternBoard.module.css';

interface PatternBoardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string | number, correct: boolean) => void;
  disabled?: boolean;
  resetKey?: number;
}

export function PatternBoard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  disabled,
  resetKey = 0,
}: PatternBoardProps) {
  const { t } = useLanguage();
  const sequence = useMemo(
    () => question.visualMeta?.sequence ?? parsePatternSequence(question.prompt),
    [question.prompt, question.visualMeta?.sequence],
  );
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(false);
  }, [question.id, resetKey]);

  const promptLine = question.prompt.split('\n')[0] ?? question.prompt;
  const choices = (question.choices ?? []) as string[];

  const pickAnswer = (value: string | number) => {
    if (disabled || locked) return;
    playPop();
    setLocked(true);
    const correct = String(value) === String(question.correctAnswer);
    if (correct) playCorrect();
    onAnswer(value, correct);
  };

  return (
    <div className={styles.board}>
      <p className={styles.progress}>
        {t('common.question', { current: questionNumber, total: totalQuestions })}
      </p>

      <div className={styles.promptBox}>
        <p className={styles.prompt}>{promptLine}</p>
        <p className={styles.hint}>{t('preschool.pickMissingPiece')}</p>
      </div>

      <div className={patternStyles.sequence} aria-hidden="true">
        {sequence.map((item, index) => (
          <span
            key={`${question.id}-seq-${index}`}
            className={`${patternStyles.tile} ${item === '?' ? patternStyles.gap : ''}`}
          >
            {item}
          </span>
        ))}
      </div>

      <div className={patternStyles.choices}>
        {choices.map((choice) => (
          <button
            key={`${question.id}-pat-${choice}`}
            type="button"
            className={patternStyles.choiceBtn}
            onClick={() => pickAnswer(choice)}
            disabled={disabled || locked}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}

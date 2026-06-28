import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { playCorrect } from '../../lib/audio';
import { parseCountingVisual } from '../../lib/preschoolConfig';
import type { Question } from '../../lib/types';
import { useTapGrid } from './useTapGrid';
import styles from './TapToCountBoard.module.css';

interface TapToCountBoardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string | number, correct: boolean) => void;
  disabled?: boolean;
  resetKey?: number;
}

export function TapToCountBoard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  disabled,
  resetKey = 0,
}: TapToCountBoardProps) {
  const { t } = useLanguage();
  const items = useMemo(() => parseCountingVisual(question.prompt), [question.prompt]);
  const [locked, setLocked] = useState(false);
  const { tapped, toggleTap } = useTapGrid({
    itemCount: items.length,
    resetKey: `${question.id}-${resetKey}`,
    disabled: disabled || locked,
  });

  useEffect(() => {
    setLocked(false);
  }, [question.id, resetKey]);

  const promptLine = question.prompt.split('\n')[0] ?? question.prompt;
  const choices = question.choices ?? [];

  const toggleTapItem = (index: number) => {
    if (disabled || locked) return;
    toggleTap(index);
  };

  const pickAnswer = (value: number | string) => {
    if (disabled || locked) return;
    setLocked(true);
    const correct = Number(value) === Number(question.correctAnswer);
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
        <p className={styles.hint}>{t('preschool.tapEachOne')}</p>
      </div>

      <div className={styles.counter} aria-live="polite">
        <span className={styles.counterEmoji} aria-hidden="true">
          👆
        </span>
        <span className={styles.counterValue}>{tapped.size}</span>
        <span className={styles.counterLabel}>{t('preschool.tapped')}</span>
      </div>

      <div className={styles.itemGrid} role="group" aria-label={t('preschool.countObjects')}>
        {items.map((emoji, index) => {
          const isTapped = tapped.has(index);
          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              className={`${styles.item} ${isTapped ? styles.itemTapped : ''}`}
              onClick={() => toggleTapItem(index)}
              disabled={disabled || locked}
              aria-pressed={isTapped}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className={styles.itemEmoji} aria-hidden="true">
                {emoji}
              </span>
            </button>
          );
        })}
      </div>

      <p className={styles.pickLabel}>{t('preschool.pickNumber')}</p>

      <div className={styles.choices}>
        {choices.map((choice) => (
          <button
            key={`${question.id}-choice-${String(choice)}`}
            type="button"
            className={styles.choiceBtn}
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

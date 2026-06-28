import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { playCorrect, playPop } from '../../lib/audio';
import { renderCompareGroups } from '../../lib/questions/preschoolVisual';
import type { Question } from '../../lib/types';
import styles from './TapToCountBoard.module.css';
import compareStyles from './CompareBoard.module.css';

interface CompareBoardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string | number, correct: boolean) => void;
  disabled?: boolean;
  resetKey?: number;
}

export function CompareBoard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  disabled,
  resetKey = 0,
}: CompareBoardProps) {
  const { t } = useLanguage();
  const meta = question.visualMeta;
  const groups = useMemo(
    () => (meta?.kind === 'compare' ? renderCompareGroups(meta) : { left: '', right: '' }),
    [meta],
  );
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setLocked(false);
  }, [question.id, resetKey]);

  const pickGroup = (value: number) => {
    if (disabled || locked || !meta) return;
    playPop();
    setLocked(true);
    const correct = Number(value) === Number(question.correctAnswer);
    if (correct) playCorrect();
    onAnswer(value, correct);
  };

  const groupA = meta?.groupA ?? 0;
  const groupB = meta?.groupB ?? 0;

  return (
    <div className={styles.board}>
      <p className={styles.progress}>
        {t('common.question', { current: questionNumber, total: totalQuestions })}
      </p>

      <div className={styles.promptBox}>
        <p className={styles.prompt}>{question.prompt}</p>
        <p className={styles.hint}>{t('preschool.tapBiggerGroup')}</p>
      </div>

      <div className={compareStyles.groups} role="group" aria-label={question.prompt}>
        <button
          type="button"
          className={compareStyles.groupBtn}
          onClick={() => pickGroup(groupA)}
          disabled={disabled || locked}
        >
          <span className={compareStyles.groupEmoji}>{groups.left}</span>
          <span className={compareStyles.groupCount}>{groupA}</span>
        </button>
        <button
          type="button"
          className={compareStyles.groupBtn}
          onClick={() => pickGroup(groupB)}
          disabled={disabled || locked}
        >
          <span className={compareStyles.groupEmoji}>{groups.right}</span>
          <span className={compareStyles.groupCount}>{groupB}</span>
        </button>
      </div>
    </div>
  );
}

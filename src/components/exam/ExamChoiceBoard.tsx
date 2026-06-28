import { useEffect, useState } from 'react';
import { BigButton } from '../BigButton';
import { useLanguage } from '../../context/LanguageContext';
import type { ExamQuestion } from '../../lib/exam/examBuilder';
import { speak } from '../../lib/speech';
import styles from './ExamChoiceBoard.module.css';

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

interface ExamChoiceBoardProps {
  question: ExamQuestion;
  questionNumber: number;
  totalQuestions: number;
  topicLabel: string;
  hintText?: string | null;
  onAnswer: (correct: boolean) => void;
  onContinue: () => void;
  disabled?: boolean;
  resetKey?: number;
}

export function ExamChoiceBoard({
  question,
  questionNumber,
  totalQuestions,
  topicLabel,
  hintText,
  onAnswer,
  onContinue,
  disabled,
  resetKey = 0,
}: ExamChoiceBoardProps) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string | number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [readyForNext, setReadyForNext] = useState(false);

  useEffect(() => {
    setSelected(null);
    setRevealed(false);
    setReadyForNext(false);
    speak(question.prompt.replace(/\n/g, '. '));
  }, [question.id, question.prompt, resetKey]);

  const choices = question.choices ?? [];

  const isCorrectChoice = (choice: string | number) =>
    String(choice) === String(question.correctAnswer) ||
    Number(choice) === Number(question.correctAnswer);

  const handleChoice = (choice: string | number) => {
    if (disabled || revealed) return;
    setSelected(choice);
    setRevealed(true);
    setReadyForNext(true);
    onAnswer(isCorrectChoice(choice));
  };

  const getChoiceClass = (choice: string | number) => {
    if (!revealed) return styles.choice;
    if (isCorrectChoice(choice)) return `${styles.choice} ${styles.choiceCorrect}`;
    if (String(choice) === String(selected)) return `${styles.choice} ${styles.choiceWrong}`;
    return styles.choice;
  };

  return (
    <div className={styles.board}>
      <div className={styles.spotlight}>
        <span className={styles.topicEmoji} aria-hidden="true">
          {question.topicEmoji}
        </span>
        <span className={styles.topicLabel}>{topicLabel}</span>
      </div>

      <p className={styles.progress}>
        {t('common.question', { current: questionNumber, total: totalQuestions })}
      </p>

      <div className={styles.promptBox}>
        <p className={styles.prompt}>{question.prompt}</p>
      </div>

      {hintText ? <p className={styles.hintReveal}>{hintText}</p> : null}

      <div className={styles.choices}>
        {choices.map((choice, index) => (
          <button
            key={`${question.id}-${String(choice)}`}
            type="button"
            className={getChoiceClass(choice)}
            style={{ animationDelay: `${index * 0.06}s` }}
            onClick={() => handleChoice(choice)}
            disabled={disabled || revealed}
          >
            <span className={styles.choiceLetter}>{CHOICE_LABELS[index] ?? '?'}</span>
            <span className={styles.choiceValue}>{choice}</span>
          </button>
        ))}
      </div>

      {readyForNext ? (
        <div className={styles.nextRow}>
          <BigButton onClick={onContinue} fullWidth>
            {isCorrectChoice(selected as string | number)
              ? t('exam.continueBtn')
              : t('exam.continueAnyway')}
          </BigButton>
        </div>
      ) : null}
    </div>
  );
}

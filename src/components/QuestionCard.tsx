import { useEffect, useState } from 'react';
import type { Question } from '../lib/types';
import { speak } from '../lib/speech';
import { playTap } from '../lib/audio';
import { useLanguage } from '../context/LanguageContext';
import { BigButton } from './BigButton';
import styles from './QuestionCard.module.css';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string | number, correct: boolean) => void;
  disabled?: boolean;
  resetKey?: number;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  disabled,
  resetKey = 0,
}: QuestionCardProps) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string | number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setSelected(null);
    setInputValue('');
    setRevealed(false);
    speak(question.prompt.replace(/\n/g, '. '));
  }, [question.id, question.prompt, resetKey]);

  const handleChoice = (choice: string | number) => {
    if (disabled || revealed) return;
    playTap();
    setSelected(choice);
    setRevealed(true);
    const correct =
      String(choice) === String(question.correctAnswer) ||
      Number(choice) === Number(question.correctAnswer);
    onAnswer(choice, correct);
  };

  const handleSubmit = () => {
    if (disabled || revealed || inputValue.trim() === '') return;
    setRevealed(true);
    const correct = Number(inputValue) === Number(question.correctAnswer);
    onAnswer(Number(inputValue), correct);
  };

  const getChoiceClass = (choice: string | number) => {
    if (!revealed) return styles.choice;
    const isCorrect =
      String(choice) === String(question.correctAnswer) ||
      Number(choice) === Number(question.correctAnswer);
    if (isCorrect) return `${styles.choice} ${styles.choiceCorrect}`;
    if (String(choice) === String(selected)) return `${styles.choice} ${styles.choiceWrong}`;
    return styles.choice;
  };

  return (
    <div className={styles.card}>
      <p className={styles.progress}>
        {t('common.question', { current: questionNumber, total: totalQuestions })}
      </p>
      <div
        className={styles.progressBar}
        role="progressbar"
        aria-valuenow={questionNumber}
        aria-valuemin={1}
        aria-valuemax={totalQuestions}
      >
        <div
          className={styles.progressFill}
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>
      <div className={styles.progressDots} aria-hidden="true">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const step = index + 1;
          const done = step < questionNumber;
          const current = step === questionNumber;
          return (
            <span
              key={step}
              className={`${styles.dot} ${done ? styles.dotDone : ''} ${current ? styles.dotCurrent : ''}`}
            />
          );
        })}
      </div>
      <div className={styles.promptBox}>
        <p className={styles.prompt}>{question.prompt}</p>
      </div>

      {question.inputType === 'choice' && question.choices ? (
        <div className={styles.choices} role="group" aria-label={t('common.answerChoices')}>
          {question.choices.map((choice) => (
            <button
              key={String(choice)}
              type="button"
              className={getChoiceClass(choice)}
              onClick={() => handleChoice(choice)}
              disabled={disabled || revealed}
              aria-label={`${choice}`}
            >
              {choice}
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.numberInput}>
          <label htmlFor="answer-input" className="sr-only">
            {t('common.yourAnswer')}
          </label>
          <input
            id="answer-input"
            type="number"
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={disabled || revealed}
            aria-label={t('common.yourAnswer')}
          />
          <BigButton onClick={handleSubmit} disabled={disabled || revealed || !inputValue.trim()}>
            {t('common.checkAnswer')}
          </BigButton>
        </div>
      )}
    </div>
  );
}

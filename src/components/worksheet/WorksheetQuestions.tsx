import type { Question } from '../../lib/types';
import { parseWorksheetQuestion } from '../../lib/worksheets';
import styles from './WorksheetQuestions.module.css';

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

interface WorksheetQuestionsProps {
  questions: Question[];
  choicesLabel: string;
  answerLineLabel: string;
  variant?: 'preview' | 'print';
}

export function WorksheetQuestions({
  questions,
  choicesLabel,
  answerLineLabel,
  variant = 'preview',
}: WorksheetQuestionsProps) {
  return (
    <ol className={`${styles.list} ${variant === 'print' ? styles.listPrint : ''}`}>
      {questions.map((question, index) => {
        const { heading, visual } = parseWorksheetQuestion(question);
        const choices = question.choices ?? [];

        return (
          <li key={question.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <span className={styles.number}>{index + 1}</span>
              <p className={styles.heading}>{heading}</p>
            </div>

            {visual ? (
              <div className={styles.visual} aria-hidden="true">
                {visual}
              </div>
            ) : null}

            {question.inputType === 'choice' && choices.length > 0 ? (
              <div className={styles.choicesBlock}>
                <span className={styles.choicesLabel}>{choicesLabel}</span>
                <ul className={styles.choices}>
                  {choices.map((choice, choiceIndex) => (
                    <li key={`${question.id}-${String(choice)}`}>
                      <span className={styles.choiceLetter}>
                        {CHOICE_LABELS[choiceIndex] ?? '?'}
                      </span>
                      {choice}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className={styles.answerLine}>{answerLineLabel}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

interface WorksheetAnswerKeyProps {
  questions: Question[];
}

export function WorksheetAnswerKey({ questions }: WorksheetAnswerKeyProps) {
  return (
    <ol className={styles.answerKeyList}>
      {questions.map((question, index) => (
        <li key={question.id}>
          <span className={styles.answerNum}>{index + 1}</span>
          <span className={styles.answerValue}>{question.correctAnswer}</span>
        </li>
      ))}
    </ol>
  );
}

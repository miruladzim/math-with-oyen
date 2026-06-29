import { useEffect } from 'react';
import { CORRECT_FEEDBACK_MS, WRONG_FEEDBACK_MS } from '../lib/feedbackTiming';
import styles from './GameFeedbackPopup.module.css';

export interface GameFeedback {
  type: 'success' | 'error';
  message: string;
  pulse: number;
}

export function createGameFeedback(
  type: GameFeedback['type'],
  message: string,
): GameFeedback {
  return { type, message, pulse: Date.now() };
}

interface GameFeedbackPopupProps {
  feedback: GameFeedback;
  /** Called when the popup finishes — clear parent state so the student can retry. */
  onDismiss: () => void;
  durationMs?: number;
}

const DEFAULT_DURATION = {
  success: CORRECT_FEEDBACK_MS,
  error: WRONG_FEEDBACK_MS,
} as const;

export function GameFeedbackPopup({ feedback, onDismiss, durationMs }: GameFeedbackPopupProps) {
  const icon = feedback.type === 'success' ? '🎉' : '😿';
  const showMs = durationMs ?? DEFAULT_DURATION[feedback.type];

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, showMs);
    return () => window.clearTimeout(timer);
  }, [feedback.pulse, onDismiss, showMs]);

  return (
    <div
      key={feedback.pulse}
      className={`${styles.overlay} ${feedback.type === 'success' ? styles.overlaySuccess : ''}`}
      style={{ ['--show-ms' as string]: `${showMs}ms` }}
      role="alertdialog"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={`${styles.card} ${styles[feedback.type]}`}>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        <p className={styles.message}>{feedback.message}</p>
      </div>
    </div>
  );
}

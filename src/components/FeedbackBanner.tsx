import styles from './FeedbackBanner.module.css';

interface FeedbackBannerProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export function FeedbackBanner({ type, message }: FeedbackBannerProps) {
  return (
    <div className={`${styles.banner} ${styles[type]}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}

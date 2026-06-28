import styles from './MistakeAlert.module.css';

interface MistakeAlertProps {
  message: string;
}

export function MistakeAlert({ message }: MistakeAlertProps) {
  return (
    <div className={styles.alert} role="alert">
      <span className={styles.icon} aria-hidden="true">
        ⚠️
      </span>
      <p className={styles.text}>{message}</p>
    </div>
  );
}

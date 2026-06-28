import styles from './StarDisplay.module.css';

interface StarDisplayProps {
  count: 0 | 1 | 2 | 3;
  max?: number;
  large?: boolean;
  label?: string;
}

export function StarDisplay({ count, max = 3, large, label }: StarDisplayProps) {
  return (
    <span
      className={`${styles.stars} ${large ? styles.large : ''}`}
      role="img"
      aria-label={label ?? `${count} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`${styles.star} ${i < count ? styles.starEarned : styles.starEmpty}`}
          aria-hidden="true"
        >
          ⭐
        </span>
      ))}
    </span>
  );
}

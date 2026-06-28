import styles from './DropZone.module.css';

interface DropZoneProps {
  label?: string;
  filled?: string | null;
  active?: boolean;
  onDrop: () => void;
  large?: boolean;
}

export function DropZone({ label, filled, active, onDrop, large }: DropZoneProps) {
  return (
    <button
      type="button"
      className={`${styles.zone} ${active ? styles.active : ''} ${filled ? styles.filled : ''} ${large ? styles.large : ''}`}
      onClick={onDrop}
      aria-label={label ?? filled ?? 'Drop zone'}
    >
      {filled ?? label ?? '?'}
    </button>
  );
}

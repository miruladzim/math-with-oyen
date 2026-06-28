import styles from './NumberTraceCanvas.module.css';

export interface TraceDot {
  x: number;
  y: number;
}

interface NumberTraceCanvasProps {
  digit: number;
  dots: TraceDot[];
  nextDot: number;
  disabled?: boolean;
  onTapDot: (index: number) => void;
  hint: string;
  ariaLabel: string;
}

export function NumberTraceCanvas({
  digit,
  dots,
  nextDot,
  disabled,
  onTapDot,
  hint,
  ariaLabel,
}: NumberTraceCanvasProps) {
  return (
    <div className={styles.stage}>
      <p className={styles.hint}>{hint}</p>
      <div className={styles.traceArea} aria-label={ariaLabel}>
        <span className={styles.ghostDigit} aria-hidden="true">
          {digit}
        </span>
        {dots.map((dot, index) => (
          <button
            key={`trace-dot-${index}`}
            type="button"
            className={`${styles.dot} ${index < nextDot ? styles.dotDone : ''} ${index === nextDot ? styles.dotNext : ''}`}
            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
            onClick={() => onTapDot(index)}
            disabled={disabled}
            aria-label={String(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import styles from './StepGuide.module.css';

interface StepGuideProps {
  steps: string[];
  title: string;
  toggleLabel: string;
}

export function StepGuide({ steps, title, toggleLabel }: StepGuideProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={title}
      >
        {toggleLabel} {open ? '▲' : '▼'}
      </button>
      {open ? (
        <ol className={styles.list}>
          {steps.map((step, index) => (
            <li key={index}>
              <span className={styles.num} aria-hidden="true">
                {index + 1}
              </span>
              <span className={styles.stepText}>{step}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

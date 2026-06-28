import type { ReactNode } from 'react';
import styles from './PreschoolShell.module.css';

interface PreschoolShellProps {
  children: ReactNode;
  /** Optional playful banner above content */
  banner?: string;
}

export function PreschoolShell({ children, banner }: PreschoolShellProps) {
  return (
    <div className={styles.shell} data-preschool="true">
      <div className={styles.sparkles} aria-hidden="true">
        <span>✨</span>
        <span>🌈</span>
        <span>⭐</span>
      </div>
      {banner ? (
        <p className={styles.banner} role="note">
          {banner}
        </p>
      ) : null}
      {children}
    </div>
  );
}

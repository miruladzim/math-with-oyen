import type { ReactNode } from 'react';
import styles from './CollapsibleSection.module.css';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}

export function CollapsibleSection({
  id,
  title,
  subtitle,
  badge,
  defaultOpen = true,
  className,
  children,
}: CollapsibleSectionProps) {
  return (
    <details id={id} className={`${styles.section} ${className ?? ''}`.trim()} open={defaultOpen}>
      <summary className={styles.summary}>
        <span className={styles.summaryText}>
          <span className={styles.summaryTitle}>{title}</span>
          {subtitle ? <span className={styles.summarySubtitle}>{subtitle}</span> : null}
        </span>
        {badge ? <span className={styles.badge}>{badge}</span> : null}
        <span className={styles.chevron} aria-hidden="true">
          ▼
        </span>
      </summary>
      <div className={styles.body}>
        <div className={styles.bodyInner}>{children}</div>
      </div>
    </details>
  );
}

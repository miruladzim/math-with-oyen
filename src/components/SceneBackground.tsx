import styles from './SceneBackground.module.css';

export function SceneBackground() {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      <div className={`${styles.blob} ${styles.blob1}`} />
      <div className={`${styles.blob} ${styles.blob2}`} />
    </div>
  );
}

import { OyenAvatar } from './OyenAvatar';
import styles from './Mascot.module.css';

interface MascotProps {
  message?: string;
  bubble?: string;
}

export function Mascot({ message = "Let's learn math!", bubble = 'Meow!' }: MascotProps) {
  return (
    <div className={styles.mascot} aria-hidden="true">
      <div className={styles.characterWrap}>
        <OyenAvatar size="xl" className={styles.avatar} />
        {bubble && <div className={styles.bubble}>{bubble}</div>}
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

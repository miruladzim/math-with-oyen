import { Confetti } from './Confetti';
import { StarDisplay } from './StarDisplay';
import { BigButton } from './BigButton';
import { BackButton } from './BackButton';
import { useLanguage } from '../context/LanguageContext';
import styles from './VictoryScreen.module.css';

interface VictoryScreenProps {
  title: string;
  subtitle: string;
  encouragement?: string;
  stars: 0 | 1 | 2 | 3;
  onPlayAgain: () => void;
  onExit: () => void;
  playAgainLabel?: string;
  backLabel?: string;
}

export function VictoryScreen({
  title,
  subtitle,
  encouragement,
  stars,
  onPlayAgain,
  onExit,
  playAgainLabel,
  backLabel,
}: VictoryScreenProps) {
  const { t } = useLanguage();

  return (
    <div className={styles.screen}>
      <BackButton
        label={backLabel ?? t('games.backToGames')}
        onClick={onExit}
      />
      <Confetti active />
      <div className={styles.card}>
        <span className={styles.trophy} aria-hidden="true">
          🏆
        </span>
        <h2 className={styles.title}>{title}</h2>
        {encouragement ? <p className={styles.encouragement}>{encouragement}</p> : null}
        <p className={styles.subtitle}>{subtitle}</p>
        <StarDisplay count={stars} large />
        <div className={styles.actions}>
          <BigButton onClick={onPlayAgain} fullWidth>
            {playAgainLabel ?? t('games.playAgain')}
          </BigButton>
          <BigButton onClick={onExit} variant="outline" fullWidth>
            {backLabel ?? t('games.backToGames')}
          </BigButton>
        </div>
      </div>
    </div>
  );
}

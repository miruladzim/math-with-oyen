import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BalloonPop } from '../games/BalloonPop';
import { CrystalCave } from '../games/CrystalCave';
import { FractionPizza } from '../games/FractionPizza';
import { NumberMatch } from '../games/NumberMatch';
import { RocketLaunch } from '../games/RocketLaunch';
import { TreasureDive } from '../games/TreasureDive';
import { FadeView } from '../components/FadeView';
import { BackButton } from '../components/BackButton';
import { KidHint } from '../components/KidHint';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { getArcadeHint } from '../lib/hints';
import { getGamesForGrade, isPreschool } from '../lib/preschoolConfig';
import { PreschoolShell } from '../components/preschool/PreschoolShell';
import styles from './Games.module.css';

type GameId = 'balloon' | 'match' | 'pizza' | 'rocket' | 'dive' | 'crystal' | null;

const VALID_GAMES: GameId[] = ['balloon', 'match', 'pizza', 'rocket', 'dive', 'crystal'];

function readLaunchGame(allowedGames: readonly string[]): GameId {
  const play = new URLSearchParams(window.location.search).get('play');
  if (play && VALID_GAMES.includes(play as GameId) && allowedGames.includes(play)) {
    return play as GameId;
  }
  return null;
}

export function Games() {
  const { t, language } = useLanguage();
  const { gradeLevel } = useProgress();
  const preschoolMode = isPreschool(gradeLevel);
  const allowedGames = useMemo(() => getGamesForGrade(gradeLevel), [gradeLevel]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeGame, setActiveGame] = useState<GameId>(() => readLaunchGame(allowedGames));

  useEffect(() => {
    const play = searchParams.get('play');
    if (play && VALID_GAMES.includes(play as GameId) && allowedGames.includes(play)) {
      setActiveGame(play as GameId);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, allowedGames]);

  const exitGame = () => setActiveGame(null);

  const GAMES = [
    {
      id: 'balloon' as const,
      emoji: '🎈',
      title: t('games.balloon.title'),
      desc: t('games.balloon.desc'),
      theme: styles.balloonTheme,
    },
    {
      id: 'rocket' as const,
      emoji: '🚀',
      title: t('games.rocket.title'),
      desc: t('games.rocket.desc'),
      theme: styles.rocketTheme,
    },
    {
      id: 'dive' as const,
      emoji: '🏊',
      title: t('games.dive.title'),
      desc: t('games.dive.desc'),
      theme: styles.diveTheme,
    },
    {
      id: 'crystal' as const,
      emoji: '💎',
      title: t('games.crystal.title'),
      desc: t('games.crystal.desc'),
      theme: styles.crystalTheme,
    },
    {
      id: 'match' as const,
      emoji: '🃏',
      title: t('games.match.title'),
      desc: t('games.match.desc'),
      theme: styles.matchTheme,
    },
    {
      id: 'pizza' as const,
      emoji: '🍕',
      title: t('games.pizza.title'),
      desc: t('games.pizza.desc'),
      theme: styles.pizzaTheme,
    },
  ];

  let content: ReactNode;

  if (activeGame === 'balloon') {
    content = (
      <div className={styles.gameArea}>
        <BalloonPop onExit={exitGame} />
      </div>
    );
  } else if (activeGame === 'rocket') {
    content = (
      <div className={styles.gameArea}>
        <RocketLaunch onExit={exitGame} />
      </div>
    );
  } else if (activeGame === 'dive') {
    content = (
      <div className={styles.gameArea}>
        <TreasureDive onExit={exitGame} />
      </div>
    );
  } else if (activeGame === 'crystal') {
    content = (
      <div className={styles.gameArea}>
        <CrystalCave onExit={exitGame} />
      </div>
    );
  } else if (activeGame === 'match') {
    content = (
      <div className={styles.gameArea}>
        <NumberMatch onExit={exitGame} />
      </div>
    );
  } else if (activeGame === 'pizza') {
    content = (
      <div className={styles.gameArea}>
        <FractionPizza onExit={exitGame} />
      </div>
    );
  } else {
    const hub = (
      <div className={styles.page}>
        <BackButton label={t('practice.backHome')} to="/" />
        <div className={styles.header}>
          <h1 className={styles.title}>{t('games.arcadeTitle')}</h1>
          <p className={styles.subtitle}>
            {preschoolMode ? t('home.gamesDescPreschool') : t('games.arcadeSubtitle')}
          </p>
        </div>

        <KidHint variant="howTo" message={getArcadeHint(language)} />

        <div className={styles.gameGrid}>
          {GAMES.filter((game) => allowedGames.includes(game.id)).map((game) => (
            <button
              key={game.id}
              type="button"
              className={`${styles.gameCard} ${game.theme}`}
              onClick={() => setActiveGame(game.id)}
            >
              <span className={styles.gameArt} aria-hidden="true">
                {game.emoji}
              </span>
              <div className={styles.gameInfo}>
                <h3>{game.title}</h3>
                <p>{game.desc}</p>
              </div>
              <span className={styles.playBadge}>▶️ {t('games.play')}</span>
            </button>
          ))}
        </div>
      </div>
    );
    content = preschoolMode ? (
      <PreschoolShell banner={t('preschool.gamesBanner')}>{hub}</PreschoolShell>
    ) : (
      hub
    );
  }

  return (
    <FadeView viewKey={activeGame ?? 'menu'} scrollTopOnEnter>
      {content}
    </FadeView>
  );
}

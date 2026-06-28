import { useCallback, useEffect, useRef, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { PreschoolShell } from '../components/preschool/PreschoolShell';
import { PreschoolVictoryScreen } from '../components/preschool/PreschoolVictoryScreen';
import { createGameFeedback, GameFeedbackPopup, type GameFeedback } from '../components/GameFeedbackPopup';
import { GameHUD } from '../components/GameHUD';
import { GameCoach } from '../components/GameCoach';
import { GamePrompt } from '../components/GamePrompt';
import { VictoryScreen } from '../components/VictoryScreen';
import { useGameTimers } from '../hooks/useGameTimers';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { playCorrect, playIncorrect, playSuccess } from '../lib/audio';
import { recordSession } from '../lib/progress';
import { generateAddSub10Question } from '../lib/questions/addSub';
import {
  buildPreschoolMatchDeck,
  PRESCHOOL_MATCH_PAIRS,
} from '../lib/questions/preschoolMatch';
import { isPreschool } from '../lib/preschoolConfig';
import { speak } from '../lib/speech';
import shared from './shared.module.css';
import styles from './NumberMatch.module.css';

interface NumberMatchProps {
  onExit: () => void;
}

interface MatchCard {
  id: string;
  text: string;
  pairId: string;
  type: 'equation' | 'answer' | 'visual' | 'numeral' | 'shape' | 'name';
}

function buildDeck(language: 'en' | 'ms', preschool: boolean): MatchCard[] {
  if (preschool) {
    return buildPreschoolMatchDeck(language) as MatchCard[];
  }

  const pairs: MatchCard[] = [];
  const usedAnswers = new Set<number>();

  for (let i = 0; i < 3; i++) {
    let q = generateAddSub10Question(2, language);
    let ans = Number(q.correctAnswer);
    while (usedAnswers.has(ans)) {
      q = generateAddSub10Question(2, language);
      ans = Number(q.correctAnswer);
    }
    usedAnswers.add(ans);

    const pairId = `pair-${i}`;
    pairs.push({
      id: `${pairId}-eq`,
      text: q.prompt.replace(' = ?', ''),
      pairId,
      type: 'equation',
    });
    pairs.push({
      id: `${pairId}-ans`,
      text: String(ans),
      pairId,
      type: 'answer',
    });
  }

  return pairs.sort(() => Math.random() - 0.5);
}

function matchEncouragement(stars: 0 | 1 | 2 | 3): 'perfect' | 'great' | 'good' | 'try' {
  if (stars === 3) return 'perfect';
  if (stars === 2) return 'great';
  if (stars === 1) return 'good';
  return 'try';
}

export function NumberMatch({ onExit }: NumberMatchProps) {
  const { progress, setProgress, gradeLevel } = useProgress();
  const { t, language } = useLanguage();
  const preschool = isPreschool(gradeLevel);
  const pairTotal = preschool ? PRESCHOOL_MATCH_PAIRS : 3;
  const { schedule } = useGameTimers();
  const [cards, setCards] = useState<MatchCard[]>(() => buildDeck(language, preschool));
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);
  const [pairsFound, setPairsFound] = useState(0);
  const [done, setDone] = useState(false);
  const [mismatchHint, setMismatchHint] = useState(false);
  const [feedback, setFeedback] = useState<GameFeedback | null>(null);
  const victoryRecorded = useRef(false);

  const allMatched = matched.length === cards.length && cards.length > 0;

  const resetGame = useCallback(() => {
    setCards(buildDeck(language, preschool));
    setFlipped([]);
    setMatched([]);
    setLock(false);
    setMoves(0);
    setPairsFound(0);
    setDone(false);
    setMismatchHint(false);
    setFeedback(null);
    victoryRecorded.current = false;
  }, [language, preschool]);

  useEffect(() => {
    resetGame();
  }, [language, preschool, resetGame]);

  useEffect(() => {
    if (!allMatched || done || victoryRecorded.current) return;
    victoryRecorded.current = true;
    setProgress(
      recordSession(progress, preschool ? 'shapes' : 'addSub10', pairTotal, pairTotal),
    );
    playSuccess();
    speak(t('games.matchAllSpeech'));
    setDone(true);
  }, [allMatched, done, pairTotal, preschool, progress, setProgress, t]);

  const handleFlip = useCallback(
    (cardId: string) => {
      if (lock || done || flipped.includes(cardId) || matched.includes(cardId)) return;

      const newFlipped = [...flipped, cardId];
      setFlipped(newFlipped);

      if (newFlipped.length === 2) {
        setMoves((m) => m + 1);
        setLock(true);
        const [a, b] = newFlipped.map((id) => cards.find((c) => c.id === id)!);
        const isMatch = a.pairId === b.pairId && a.type !== b.type;

        if (isMatch) {
          playCorrect();
          speak(t('common.match'));
          setPairsFound((p) => p + 1);
          setMatched((m) => [...m, a.id, b.id]);
          setFlipped([]);
          setLock(false);
          setMismatchHint(false);
          setFeedback(null);
        } else {
          playIncorrect();
          speak(preschool ? t('preschool.matchTryAgain') : t('games.matchWrong'));
          setMismatchHint(true);
          setFeedback(
            createGameFeedback(
              'error',
              preschool ? t('preschool.matchTryAgain') : t('games.matchWrong'),
            ),
          );
          schedule(() => {
            setFlipped([]);
            setLock(false);
            setFeedback(null);
          }, preschool ? 1100 : 900);
        }
      }
    },
    [cards, done, flipped, lock, matched, preschool, schedule, t],
  );

  if (done) {
    const stars = (moves <= 8 ? 3 : moves <= 12 ? 2 : 1) as 0 | 1 | 2 | 3;
    const encouragementKey = matchEncouragement(stars);
    const victory = (
      <PreschoolVictoryScreen
        title={t('games.matchVictory')}
        encouragement={t(`victory.${encouragementKey}`)}
        subtitle={t('games.matchVictorySub', { moves })}
        stars={stars}
        onPlayAgain={resetGame}
        onExit={onExit}
        backLabel={t('games.backGames')}
      />
    );
    return preschool ? (
      <PreschoolShell banner={t('preschool.gamesBanner')}>{victory}</PreschoolShell>
    ) : (
      <VictoryScreen
        title={t('games.matchVictory')}
        encouragement={t(`victory.${encouragementKey}`)}
        subtitle={t('games.matchVictorySub', { moves })}
        stars={stars}
        onPlayAgain={resetGame}
        onExit={onExit}
        backLabel={t('games.backGames')}
      />
    );
  }

  const gameBody = (
    <div className={shared.shell}>
      <BackButton label={t('games.backGames')} onClick={onExit} />
      <GameHUD
        icon="🃏"
        label={t('games.numberMatch')}
        current={pairsFound}
        total={pairTotal}
        score={pairsFound}
        extra={t('games.movesBadge', { moves })}
      />

      <GameCoach
        game="match"
        round={moves}
        wrongHelp={mismatchHint}
        wrongMessage={preschool ? t('preschool.matchTryAgain') : t('games.matchWrong')}
      />

      {feedback && <GameFeedbackPopup feedback={feedback} onDismiss={() => setFeedback(null)} />}

      <div className={shared.workBlock}>
        <GamePrompt icon="🃏" label={t('games.match.title')} theme="arcade" variant="questionOnly">
          {preschool ? t('games.match.descPreschool') : t('games.match.desc')}
        </GamePrompt>

        <div className={`${styles.board} ${shared.workBlockFollow}`}>
          <div className={styles.grid} role="group" aria-label={t('games.numberMatch')}>
            {cards.map((card) => {
              const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
              const isMatched = matched.includes(card.id);
              const isVisual = card.type === 'visual' || card.type === 'shape';

              return (
                <button
                  key={card.id}
                  type="button"
                  className={`${styles.cardWrap} ${isMatched ? styles.cardMatched : ''}`}
                  onClick={() => handleFlip(card.id)}
                  disabled={isMatched || lock}
                  aria-label={isFlipped ? card.text : t('games.match.hiddenCard')}
                >
                  <div className={`${styles.cardInner} ${isFlipped ? styles.cardInnerFlipped : ''}`}>
                    <div className={`${styles.cardFace} ${styles.cardBack}`}>
                      <span className={styles.cardEmoji}>🎴</span>
                    </div>
                    <div
                      className={`${styles.cardFace} ${styles.cardFront} ${card.type === 'equation' ? styles.cardEquation : styles.cardAnswer}`}
                    >
                      {isMatched ? (
                        <span className={styles.matchEmoji}>✅</span>
                      ) : isVisual ? (
                        <span className={styles.typeEmoji}>{card.text}</span>
                      ) : card.type === 'equation' ? (
                        <>
                          <span className={styles.typeEmoji}>➕</span>
                          {card.text}
                        </>
                      ) : card.type === 'name' ? (
                        <>
                          <span className={styles.typeEmoji}>🔷</span>
                          {card.text}
                        </>
                      ) : (
                        <>
                          <span className={styles.typeEmoji}>🔢</span>
                          {card.text}
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return preschool ? (
    <PreschoolShell banner={t('preschool.gamesBanner')}>{gameBody}</PreschoolShell>
  ) : (
    gameBody
  );
}

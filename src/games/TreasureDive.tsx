import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { Confetti } from '../components/Confetti';
import { createGameFeedback, GameFeedbackPopup, type GameFeedback } from '../components/GameFeedbackPopup';
import { GameHUD } from '../components/GameHUD';
import { GameCoach } from '../components/GameCoach';
import { GamePrompt } from '../components/GamePrompt';
import { VictoryScreen } from '../components/VictoryScreen';
import { useConfettiBurst } from '../hooks/useConfettiBurst';
import { useGameRounds } from '../hooks/useGameRounds';
import { useGameTimers } from '../hooks/useGameTimers';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { gameDifficulty } from '../lib/gameConfig';
import { playCorrect, playIncorrect, playSplash, playSuccess } from '../lib/audio';
import { getVictoryEncouragement, recordSession, starsFromAccuracy } from '../lib/progress';
import { generateAddSub10Question } from '../lib/questions/addSub';
import { generateCountingQuestion } from '../lib/questions/counting';
import { speak } from '../lib/speech';
import shared from './shared.module.css';
import styles from './TreasureDive.module.css';

interface TreasureDiveProps {
  onExit: () => void;
}

interface Chest {
  id: string;
  value: number;
}

function buildChests(correct: number, round: number): Chest[] {
  const wrong = new Set<number>();
  while (wrong.size < 2) {
    const w = correct + Math.floor(Math.random() * 7) - 3;
    if (w >= 0 && w !== correct) wrong.add(w);
  }
  return [correct, ...Array.from(wrong)]
    .sort(() => Math.random() - 0.5)
    .map((value, i) => ({ id: `${round}-${i}`, value }));
}

export function TreasureDive({ onExit }: TreasureDiveProps) {
  const { gradeLevel, progress, setProgress } = useProgress();
  const { t, language } = useLanguage();
  const rounds = useGameRounds();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState(0);
  const [chests, setChests] = useState<Chest[]>([]);
  const [feedback, setFeedback] = useState<GameFeedback | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const { schedule, clearAll } = useGameTimers();
  const screenConfetti = useConfettiBurst();
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);
  const [diverX, setDiverX] = useState(50);
  const [diving, setDiving] = useState(false);

  const setupRound = useCallback(
    (roundIndex: number) => {
      const diff = gameDifficulty(consecutiveWrong, 2);
      const q =
        gradeLevel === 'k1'
          ? generateCountingQuestion(diff, language)
          : generateAddSub10Question(diff, language);
      const correctAnswer = Number(q.correctAnswer);
      setPrompt(q.prompt);
      setAnswer(correctAnswer);
      setChests(buildChests(correctAnswer, roundIndex));
      setFeedback(null);
      setLocked(false);
      setDiving(false);
      setDiverX(50);
      speak(q.prompt);
    },
    [consecutiveWrong, gradeLevel, language],
  );

  useEffect(() => {
    if (!done) setupRound(round);
  }, [round, setupRound, done]);

  useEffect(() => clearAll, [clearAll]);

  const handleExit = () => {
    clearAll();
    screenConfetti.clear();
    onExit();
  };

  const finishGame = useCallback(
    (finalCorrect: number, attempts: number) => {
      setProgress(
        recordSession(
          progress,
          gradeLevel === 'k1' ? 'counting' : 'addSub10',
          finalCorrect,
          attempts,
        ),
      );
      playSuccess();
      setDone(true);
    },
    [gradeLevel, progress, setProgress],
  );

  const handleChest = (chest: Chest, index: number) => {
    if (locked) return;
    setLocked(true);
    setDiverX(16 + index * 34);
    setDiving(true);

    if (chest.value === answer) {
      setConsecutiveWrong(0);
      playSplash();
      setCorrect((prev) => {
        const newCorrect = prev + 1;
        setCombo((c) => c + 1);
        screenConfetti.burst();
        setFeedback(createGameFeedback('success', t('games.diveCorrect')));
        speak(t('common.correct'));
        playCorrect();

        schedule(() => {
          if (round + 1 >= rounds) finishGame(newCorrect, rounds + wrongCount);
          else setRound((r) => r + 1);
        }, 1000);

        return newCorrect;
      });
    } else {
      setConsecutiveWrong((value) => value + 1);
      setWrongCount((w) => w + 1);
      setCombo(0);
      setFeedback(createGameFeedback('error', t('games.diveWrong')));
      speak(t('common.notQuite'));
      playIncorrect();
      schedule(() => {
        setLocked(false);
        setDiving(false);
        setDiverX(50);
        setFeedback(null);
      }, 900);
    }
  };

  const sessionTotal = rounds + wrongCount;
  const stars = useMemo(() => starsFromAccuracy(correct, sessionTotal), [correct, sessionTotal]);
  const encouragementKey = getVictoryEncouragement(correct, sessionTotal);

  const restart = () => {
    clearAll();
    screenConfetti.clear();
    setCorrect(0);
    setWrongCount(0);
    setConsecutiveWrong(0);
    setCombo(0);
    setDone(false);
    setRound(0);
  };

  if (done) {
    return (
      <VictoryScreen
        title={t('games.diveVictory')}
        encouragement={t(`victory.${encouragementKey}`)}
        subtitle={t('games.diveVictorySub', { correct, total: rounds })}
        stars={stars}
        onPlayAgain={restart}
        onExit={handleExit}
        backLabel={t('games.backGames')}
      />
    );
  }

  return (
    <div className={shared.shell}>
      <BackButton label={t('games.backGames')} onClick={handleExit} />
      <Confetti burstKey={screenConfetti.burstKey} count={25} />
      <GameHUD
        icon="🏊"
        label={t('games.treasureDive')}
        current={round + 1}
        total={rounds}
        score={correct}
        combo={combo}
      />

      <GameCoach game="dive" round={round} wrongHelp={feedback?.type === 'error'} />

      {feedback && <GameFeedbackPopup feedback={feedback} onDismiss={() => setFeedback(null)} />}

      <div className={shared.workBlock}>
        <GamePrompt icon="🏊" label={t('games.divePrompt')} theme="ocean" variant="questionOnly">
          {prompt}
        </GamePrompt>

        <div className={`${shared.stage} ${shared.workBlockFollow} ${styles.oceanStage}`}>
        <div className={styles.oceanBg} />
        <span className={styles.sunEmoji}>☀️</span>
        {['🫧', '🫧', '🫧', '🫧', '🫧', '🫧'].map((b, i) => (
          <span
            key={i}
            className={styles.bubbleEmoji}
            style={{ left: `${8 + i * 14}%`, animationDelay: `${i * 0.4}s` }}
          >
            {b}
          </span>
        ))}
        <span className={styles.fishEmoji} style={{ top: '35%', left: '8%' }}>
          🐠
        </span>
        <span className={styles.fishEmoji} style={{ top: '45%', right: '10%' }}>
          🐡
        </span>
        <span className={styles.plantEmoji} style={{ bottom: '18%', left: '6%' }}>
          🌿
        </span>
        <span className={styles.plantEmoji} style={{ bottom: '16%', right: '8%' }}>
          🪸
        </span>
        <div
          className={`${styles.diver} ${diving ? styles.diverDown : ''}`}
          style={{ left: `${diverX}%` }}
          aria-hidden="true"
        >
          <span className={styles.diverEmoji}>🏊</span>
        </div>
        <span className={styles.sandEmoji}>🏖️</span>

        <div className={styles.chestRow} role="group" aria-label={t('games.divePrompt')}>
          {chests.map((chest, index) => (
            <button
              key={chest.id}
              type="button"
              className={styles.chestBtn}
              onClick={() => handleChest(chest, index)}
              disabled={locked}
              aria-label={String(chest.value)}
            >
              <span className={styles.chestEmoji}>🧰</span>
              <span className={styles.gemEmoji}>💎</span>
              <span className={styles.chestValue}>{chest.value}</span>
            </button>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

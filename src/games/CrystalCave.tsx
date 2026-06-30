import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { Confetti } from '../components/Confetti';
import { createGameFeedback, GameFeedbackPopup, type GameFeedback } from '../components/GameFeedbackPopup';
import { CORRECT_ADVANCE_MS, WRONG_UNLOCK_MS } from '../lib/feedbackTiming';
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
import { playCorrect, playCrystal, playIncorrect, playSuccess } from '../lib/audio';
import { getVictoryEncouragement, recordSession, starsFromAccuracy } from '../lib/progress';
import { generateAddSub10Question, generateSkipCountingQuestion } from '../lib/questions/addSub';
import { generateMultiplicationQuestion } from '../lib/questions/multiply';
import shared from './shared.module.css';
import styles from './CrystalCave.module.css';

const GEM_EMOJIS = ['💎', '🔮', '💠', '✨'] as const;

interface CrystalCaveProps {
  onExit: () => void;
}

interface Crystal {
  id: string;
  value: number;
  emoji: string;
}

function buildCrystals(correct: number, round: number): Crystal[] {
  const wrong = new Set<number>();
  while (wrong.size < 3) {
    const w = correct + Math.floor(Math.random() * 9) - 4;
    if (w >= 0 && w !== correct) wrong.add(w);
  }
  return [correct, ...Array.from(wrong)]
    .sort(() => Math.random() - 0.5)
    .map((value, i) => ({
      id: `${round}-${i}`,
      value,
      emoji: GEM_EMOJIS[i % GEM_EMOJIS.length],
    }));
}

export function CrystalCave({ onExit }: CrystalCaveProps) {
  const { gradeLevel, progress, setProgress } = useProgress();
  const { t, language } = useLanguage();
  const rounds = useGameRounds();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState(0);
  const [crystals, setCrystals] = useState<Crystal[]>([]);
  const [feedback, setFeedback] = useState<GameFeedback | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const { schedule, clearAll } = useGameTimers();
  const screenConfetti = useConfettiBurst();
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);
  const [shatterId, setShatterId] = useState<string | null>(null);

  const setupRound = useCallback(
    (roundIndex: number) => {
      const diff = gameDifficulty(consecutiveWrong, 2);
      const q =
        gradeLevel === 'grade2'
          ? generateSkipCountingQuestion(diff, language)
          : gradeLevel === 'k1'
            ? generateAddSub10Question(diff, language)
            : generateMultiplicationQuestion(diff, language);
      const correctAnswer = Number(q.correctAnswer);
      setPrompt(q.prompt);
      setAnswer(correctAnswer);
      setCrystals(buildCrystals(correctAnswer, roundIndex));
      setFeedback(null);
      setLocked(false);
      setShatterId(null);
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
      const topicId =
        gradeLevel === 'grade2'
          ? 'skipCounting'
          : gradeLevel === 'k1'
            ? 'addSub10'
            : 'multiplication';
      setProgress(recordSession(progress, topicId, finalCorrect, attempts));
      playSuccess();
      setDone(true);
    },
    [gradeLevel, progress, setProgress],
  );

  const handleCrystal = (crystal: Crystal) => {
    if (locked) return;
    setLocked(true);
    setShatterId(crystal.id);

    if (crystal.value === answer) {
      setConsecutiveWrong(0);
      playCrystal();
      setCorrect((prev) => {
        const newCorrect = prev + 1;
        setCombo((c) => c + 1);
        screenConfetti.burst();
        setFeedback(createGameFeedback('success', t('games.crystalCorrect')));
        playCorrect();

        schedule(() => {
          if (round + 1 >= rounds) finishGame(newCorrect, rounds + wrongCount);
          else setRound((r) => r + 1);
        }, CORRECT_ADVANCE_MS);

        return newCorrect;
      });
    } else {
      setConsecutiveWrong((value) => value + 1);
      setWrongCount((w) => w + 1);
      setCombo(0);
      setFeedback(createGameFeedback('error', t('games.crystalWrong')));
      playIncorrect();
      schedule(() => {
        setLocked(false);
        setShatterId(null);
        setFeedback(null);
      }, WRONG_UNLOCK_MS);
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
        title={t('games.crystalVictory')}
        encouragement={t(`victory.${encouragementKey}`)}
        subtitle={t('games.crystalVictorySub', { correct, total: rounds })}
        stars={stars}
        onPlayAgain={restart}
        onExit={handleExit}
        backLabel={t('games.backGames')}
      />
    );
  }

  return (
    <div className={shared.shell} data-play-session>
      <BackButton label={t('games.backGames')} onClick={handleExit} />
      <Confetti burstKey={screenConfetti.burstKey} count={35} />
      <GameHUD
        icon="💎"
        label={t('games.crystalCave')}
        current={round + 1}
        total={rounds}
        score={correct}
        combo={combo}
      />

      <GameCoach game="crystal" round={round} wrongHelp={feedback?.type === 'error'} />

      {feedback && <GameFeedbackPopup feedback={feedback} onDismiss={() => setFeedback(null)} />}

      <div className={shared.workBlock}>
        <GamePrompt icon="💎" label={t('games.crystalPrompt')} theme="cave" variant="questionOnly">
          {prompt}
        </GamePrompt>

        <div className={`${shared.stage} ${shared.workBlockFollow} ${styles.caveStage}`}>
        <div className={styles.caveBg} />
        <span className={styles.batEmoji}>🦇</span>
        <span className={styles.torchEmoji}>🔦</span>
        {['✨', '⭐', '✨'].map((s, i) => (
          <span
            key={i}
            className={styles.sparkleEmoji}
            style={{ left: `${18 + i * 28}%`, top: `${10 + (i % 2) * 6}%` }}
          >
            {s}
          </span>
        ))}

        <div className={styles.crystalGrid} role="group" aria-label={t('games.crystalPrompt')}>
          {crystals.map((crystal) => (
            <button
              key={crystal.id}
              type="button"
              className={`${styles.crystalBtn} ${shatterId === crystal.id ? styles.shatter : ''}`}
              onClick={() => handleCrystal(crystal)}
              disabled={locked}
              aria-label={String(crystal.value)}
            >
              <span className={styles.gemEmoji}>{crystal.emoji}</span>
              <span className={styles.crystalValue}>{crystal.value}</span>
            </button>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

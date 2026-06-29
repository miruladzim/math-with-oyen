import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { Confetti } from '../components/Confetti';
import { createGameFeedback, GameFeedbackPopup, type GameFeedback } from '../components/GameFeedbackPopup';
import { CORRECT_ADVANCE_MS, WRONG_FEEDBACK_MS } from '../lib/feedbackTiming';
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
import { playCorrect, playIncorrect, playSuccess } from '../lib/audio';
import { getVictoryEncouragement, recordSession, starsFromAccuracy } from '../lib/progress';
import { generateAddSub10Question } from '../lib/questions/addSub';
import { generateMultiplicationQuestion } from '../lib/questions/multiply';
import { speak } from '../lib/speech';
import shared from './shared.module.css';
import styles from './RocketLaunch.module.css';

const ROCKET_TRAVEL_MS = 900;
const LANDING_MESSAGE_DELAY_MS = ROCKET_TRAVEL_MS + 250;
const VICTORY_AFTER_LANDING_MS = 2800;

interface RocketLaunchProps {
  onExit: () => void;
}

interface FuelPod {
  id: string;
  value: number;
}

interface StarDot {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  bright: boolean;
}

function buildPods(correct: number, round: number): FuelPod[] {
  const wrong = new Set<number>();
  while (wrong.size < 3) {
    const w = correct + Math.floor(Math.random() * 9) - 4;
    if (w >= 0 && w !== correct) wrong.add(w);
  }
  return [correct, ...Array.from(wrong)]
    .sort(() => Math.random() - 0.5)
    .map((value, i) => ({ id: `${round}-${i}`, value }));
}

interface AccentStar {
  id: number;
  emoji: string;
  left: number;
  top: number;
  delay: number;
}

function buildAccentStars(): AccentStar[] {
  return ['✨', '⭐', '🌟'].map((emoji, id) => ({
    id,
    emoji,
    left: 4 + Math.random() * 92,
    top: 3 + Math.random() * 90,
    delay: Math.random() * 3,
  }));
}

function buildStars(count: number): StarDot[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    top: Math.random() * 92,
    size: 1 + Math.random() * 2.2,
    delay: Math.random() * 4,
    bright: Math.random() > 0.82,
  }));
}

export function RocketLaunch({ onExit }: RocketLaunchProps) {
  const { gradeLevel, progress, setProgress } = useProgress();
  const { t, language } = useLanguage();
  const rounds = useGameRounds();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState(0);
  const [pods, setPods] = useState<FuelPod[]>([]);
  const [feedback, setFeedback] = useState<GameFeedback | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const { schedule, clearAll } = useGameTimers();
  const screenConfetti = useConfettiBurst();
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [landed, setLanded] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [starSeed, setStarSeed] = useState(0);

  const stars = useMemo(() => buildStars(56), []);
  const accentStars = useMemo(() => buildAccentStars(), [starSeed]);

  const setupRound = useCallback(
    (roundIndex: number) => {
      const diff = gameDifficulty(consecutiveWrong, 2);
      const q =
        gradeLevel === 'k1' || gradeLevel === 'grade2'
          ? generateAddSub10Question(diff, language)
          : generateMultiplicationQuestion(diff, language);
      const correctAnswer = Number(q.correctAnswer);
      setPrompt(q.prompt);
      setAnswer(correctAnswer);
      setPods(buildPods(correctAnswer, roundIndex));
      setFeedback(null);
      setLocked(false);
      setPickedId(null);
      setLanded(false);
      setFinishing(false);
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
      const topicId =
        gradeLevel === 'k1' || gradeLevel === 'grade2' ? 'addSub10' : 'multiplication';
      setProgress(recordSession(progress, topicId, finalCorrect, attempts));
      playSuccess();
      setDone(true);
    },
    [gradeLevel, progress, setProgress],
  );

  const handlePick = (pod: FuelPod) => {
    if (locked) return;
    setLocked(true);
    setPickedId(pod.id);

    if (pod.value === answer) {
      setConsecutiveWrong(0);
      const isFinalRound = round + 1 >= rounds;

      setCorrect((prev) => {
        const newCorrect = prev + 1;
        setCombo((c) => c + 1);
        if (!isFinalRound) screenConfetti.burst();
        setFeedback(createGameFeedback('success', t('games.rocketCorrect')));
        speak(t('common.correct'));
        playCorrect();

        if (isFinalRound) {
          setFinishing(true);
          const attempts = rounds + wrongCount;
          const perfectRun = wrongCount === 0;

          if (perfectRun) {
            schedule(() => {
              setLanded(true);
              setFeedback(createGameFeedback('success', t('games.rocketLanded')));
              speak(t('games.rocketLanded'));
              screenConfetti.burst();
            }, LANDING_MESSAGE_DELAY_MS);

            schedule(
              () => finishGame(newCorrect, attempts),
              LANDING_MESSAGE_DELAY_MS + VICTORY_AFTER_LANDING_MS,
            );
          } else {
            schedule(() => finishGame(newCorrect, attempts), CORRECT_ADVANCE_MS);
          }
        } else {
          schedule(() => setRound((r) => r + 1), CORRECT_ADVANCE_MS);
        }

        return newCorrect;
      });
    } else {
      setConsecutiveWrong((value) => value + 1);
      setWrongCount((w) => w + 1);
      setCombo(0);
      setFeedback(createGameFeedback('error', t('games.rocketWrong')));
      speak(t('common.notQuite'));
      playIncorrect();
      schedule(() => {
        setLocked(false);
        setPickedId(null);
        setFeedback(null);
      }, WRONG_FEEDBACK_MS);
    }
  };

  const sessionTotal = rounds + wrongCount;
  const starsEarned = useMemo(
    () => starsFromAccuracy(correct, sessionTotal),
    [correct, sessionTotal],
  );
  const encouragementKey = getVictoryEncouragement(correct, sessionTotal);
  const journeyProgress = correct / rounds;
  const journeyPct = journeyProgress * 100;

  const restart = () => {
    clearAll();
    screenConfetti.clear();
    setCorrect(0);
    setWrongCount(0);
    setConsecutiveWrong(0);
    setCombo(0);
    setLanded(false);
    setFinishing(false);
    setDone(false);
    setRound(0);
    setStarSeed((seed) => seed + 1);
  };

  if (done) {
    return (
      <VictoryScreen
        title={t('games.rocketVictory')}
        encouragement={t(`victory.${encouragementKey}`)}
        subtitle={t('games.rocketVictorySub', { correct, total: rounds })}
        stars={starsEarned}
        onPlayAgain={restart}
        onExit={handleExit}
        backLabel={t('games.backGames')}
      />
    );
  }

  return (
    <div className={shared.shell}>
      <BackButton label={t('games.backGames')} onClick={handleExit} />
      <Confetti burstKey={screenConfetti.burstKey} count={30} />
      <GameHUD
        icon="🚀"
        label={t('games.rocketLaunch')}
        current={finishing ? rounds : round + 1}
        total={rounds}
        score={correct}
        combo={combo}
      />

      {!finishing && (
        <GameCoach game="rocket" round={round} wrongHelp={feedback?.type === 'error'} />
      )}

      {feedback && <GameFeedbackPopup feedback={feedback} onDismiss={() => setFeedback(null)} />}

      <div className={styles.stageWrap}>
        <div
          className={`${shared.stage} ${styles.spaceStage} ${landed ? styles.spaceStageLanded : ''} ${finishing ? styles.spaceStageFinishing : ''}`}
          style={{ '--journey': journeyProgress } as React.CSSProperties}
          aria-label={t('games.rocketJourney')}
        >
          <div className={styles.spaceBg} />
          <div className={styles.nebula} />

          {stars.map((star) => (
            <span
              key={star.id}
              className={`${styles.starDot} ${star.bright ? styles.starBright : ''}`}
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}

          {accentStars.map((star) => (
            <span
              key={star.id}
              className={styles.starEmoji}
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.delay}s`,
              }}
            >
              {star.emoji}
            </span>
          ))}

          <div className={styles.moonWrap}>
            <span className={styles.moonEmoji}>🌙</span>
            <span className={styles.moonGlow} />
          </div>

          {landed && (
            <div className={styles.landingMessage} role="status" aria-live="polite">
              <span className={styles.landingIcon}>🌙</span>
              <p>{t('games.rocketLanded')}</p>
            </div>
          )}

          <div className={styles.journeyPath} aria-hidden="true">
            <div className={styles.journeyFill} />
            {Array.from({ length: rounds }, (_, i) => (
              <span
                key={i}
                className={`${styles.waypoint} ${i < correct ? styles.waypointDone : ''}`}
                style={{ bottom: `${rounds > 1 ? (i / (rounds - 1)) * 100 : 0}%` }}
              />
            ))}
          </div>

          <div className={styles.rocketWrap}>
            <span className={styles.rocketEmoji}>🚀</span>
          </div>

          <div className={styles.earthWrap}>
            <div className={styles.launchPad} />
            <span className={styles.earthEmoji}>🌍</span>
            <span className={styles.earthGlow} />
          </div>
        </div>

        <div className={styles.journeyGauge} aria-hidden="true">
          <span className={styles.gaugeIcon}>🌙</span>
          <div className={styles.gaugeTrack}>
            <div className={styles.gaugeFill} style={{ height: `${journeyPct}%` }} />
            <span className={styles.gaugeRocket} style={{ bottom: `${journeyPct}%` }} aria-hidden="true">
              🚀
            </span>
          </div>
          <span className={styles.gaugeIcon}>🌍</span>
        </div>
        <p className={styles.journeyLegend}>{t('games.journeyLegend')}</p>
      </div>

      {!finishing && !landed && (
        <div className={shared.workBlock}>
          <GamePrompt icon="🚀" label={t('games.rocketPrompt')} theme="space" variant="questionOnly">
            {prompt}
          </GamePrompt>

          <div className={`${shared.actionRow4} ${shared.workBlockFollow}`} role="group" aria-label={t('games.rocketPrompt')}>
          {pods.map((pod) => (
          <button
            key={pod.id}
            type="button"
            className={`${styles.pod} ${pickedId === pod.id ? styles.podPicked : ''}`}
            onClick={() => handlePick(pod)}
            disabled={locked}
            aria-label={String(pod.value)}
          >
            <span className={styles.podEmoji}>⛽</span>
            <span className={styles.podValue}>{pod.value}</span>
          </button>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { PreschoolShell } from '../components/preschool/PreschoolShell';
import { PreschoolVictoryScreen } from '../components/preschool/PreschoolVictoryScreen';
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
import { gameDifficulty, preschoolGameDifficulty } from '../lib/gameConfig';
import { playCorrect, playIncorrect, playPop, playSuccess } from '../lib/audio';
import { getVictoryEncouragement, recordSession, starsFromAccuracy } from '../lib/progress';
import { generateMultiplicationQuestion } from '../lib/questions/multiply';
import { generateAddSub10Question } from '../lib/questions/addSub';
import { generateCountingQuestion } from '../lib/questions/counting';
import { isPreschool } from '../lib/preschoolConfig';
import { speak } from '../lib/speech';
import shared from './shared.module.css';
import styles from './BalloonPop.module.css';

interface BalloonPopProps {
  onExit: () => void;
}

interface BalloonItem {
  id: string;
  value: number;
  x: number;
  y: number;
  floatDuration: number;
}

interface PopBurst {
  id: number;
  x: number;
  y: number;
  success: boolean;
  particles: ReturnType<typeof buildBurstParticles>;
}

const BURST_COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ec4899', '#ef4444', '#a855f7', '#14b8a6'];
const BURST_EMOJIS = ['✨', '🎊', '⭐', '🎉'];

function buildBurstParticles(count: number, success: boolean) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i + Math.random() * 24;
    const distance = (success ? 32 : 20) + Math.random() * (success ? 26 : 14);
    const rad = (angle * Math.PI) / 180;
    const useEmoji = i % 3 === 0;
    return {
      id: i,
      color: BURST_COLORS[i % BURST_COLORS.length],
      emoji: useEmoji ? BURST_EMOJIS[i % BURST_EMOJIS.length] : null,
      tx: Math.cos(rad) * distance,
      ty: Math.sin(rad) * distance,
      size: success ? 6 + Math.random() * 6 : 5 + Math.random() * 4,
      delay: Math.random() * 0.08,
    };
  });
}

export function BalloonPop({ onExit }: BalloonPopProps) {
  const { gradeLevel, progress, setProgress } = useProgress();
  const { t, language } = useLanguage();
  const rounds = useGameRounds();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState(0);
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [feedback, setFeedback] = useState<GameFeedback | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const { schedule, clearAll } = useGameTimers();
  const screenConfetti = useConfettiBurst();
  const [done, setDone] = useState(false);
  const [poppedId, setPoppedId] = useState<string | null>(null);
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [bursts, setBursts] = useState<PopBurst[]>([]);

  const triggerPopBurst = useCallback((x: number, y: number, success: boolean) => {
    const burstId = Date.now() + Math.random();
    setBursts((prev) => [
      ...prev,
      {
        id: burstId,
        x,
        y,
        success,
        particles: buildBurstParticles(success ? 20 : 10, success),
      },
    ]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((burst) => burst.id !== burstId));
    }, 900);
  }, []);

  const setupRound = useCallback(
    (roundIndex: number) => {
      const diff = isPreschool(gradeLevel)
        ? preschoolGameDifficulty(consecutiveWrong)
        : gameDifficulty(consecutiveWrong, 2);
      const q =
        isPreschool(gradeLevel)
          ? generateCountingQuestion(diff, language, { preschool: true })
          : gradeLevel === 'k1'
            ? generateAddSub10Question(diff, language)
            : generateMultiplicationQuestion(diff, language);
      const correctAnswer = Number(q.correctAnswer);
      const wrongTarget = isPreschool(gradeLevel) ? 2 : 3;
      const wrong = new Set<number>();
      while (wrong.size < wrongTarget) {
        const spread = isPreschool(gradeLevel) ? 3 : 7;
        const w = correctAnswer + Math.floor(Math.random() * spread) - Math.floor(spread / 2);
        if (w >= 0 && w !== correctAnswer) wrong.add(w);
      }
      const values = [correctAnswer, ...Array.from(wrong)].sort(() => Math.random() - 0.5);

      const items: BalloonItem[] = values.map((value, i) => ({
        id: `${roundIndex}-${i}-${Date.now()}`,
        value,
        x: 6 + (i % 2) * 44 + Math.random() * 6,
        y: 10 + Math.floor(i / 2) * 34 + Math.random() * 6,
        floatDuration: 2 + (value % 4) * 0.5,
      }));

      setPrompt(q.prompt);
      setAnswer(correctAnswer);
      setBalloons(items);
      setFeedback(null);
      setPoppedId(null);
      setShakingId(null);
      setLocked(false);
      setBursts([]);
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
      const topicId = isPreschool(gradeLevel)
        ? 'counting'
        : gradeLevel === 'k1'
          ? 'addSub10'
          : 'multiplication';
      setProgress(recordSession(progress, topicId, finalCorrect, attempts));
      playSuccess();
      setDone(true);
    },
    [gradeLevel, progress, setProgress],
  );

  const handlePop = (balloon: BalloonItem) => {
    if (locked) return;
    setLocked(true);

    const isCorrect = balloon.value === answer;
    triggerPopBurst(balloon.x + 5, balloon.y + 11, isCorrect);
    playPop();

    if (isCorrect) {
      setPoppedId(balloon.id);
      setConsecutiveWrong(0);
      setCorrect((prev) => {
        const newCorrect = prev + 1;
        setCombo((c) => c + 1);
        screenConfetti.burst();
        setFeedback(createGameFeedback('success', t('games.popCorrect')));
        speak(t('common.correct'));
        playCorrect();

        schedule(() => {
          if (round + 1 >= rounds) finishGame(newCorrect, rounds + wrongCount);
          else setRound((r) => r + 1);
        }, 900);

        return newCorrect;
      });
    } else {
      setShakingId(balloon.id);
      setConsecutiveWrong((value) => value + 1);
      setWrongCount((w) => w + 1);
      setCombo(0);
      setFeedback(createGameFeedback('error', t('games.popWrong')));
      speak(t('common.notQuite'));
      playIncorrect();
      schedule(() => {
        setShakingId(null);
        setLocked(false);
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
    const victoryProps = {
      title: isPreschool(gradeLevel) ? t('preschool.stickerTitle') : t('games.balloonVictory'),
      encouragement: t(`victory.${encouragementKey}`),
      subtitle: isPreschool(gradeLevel)
        ? t('preschool.stickerSub')
        : t('games.balloonVictorySub', { correct, total: rounds }),
      stars,
      onPlayAgain: restart,
      onExit: handleExit,
      backLabel: t('games.backGames'),
    };
    return isPreschool(gradeLevel) ? (
      <PreschoolShell banner={t('preschool.gamesBanner')}>
        <PreschoolVictoryScreen {...victoryProps} />
      </PreschoolShell>
    ) : (
      <VictoryScreen {...victoryProps} />
    );
  }

  const gameBody = (
    <div className={`${shared.shell} ${isPreschool(gradeLevel) ? styles.preschoolShell : ''}`}>
      <BackButton label={t('games.backGames')} onClick={handleExit} />
      <Confetti burstKey={screenConfetti.burstKey} count={45} />
      <GameHUD
        icon="🎈"
        label={t('games.balloonPop')}
        current={round + 1}
        total={rounds}
        score={correct}
        combo={combo}
      />

      <GameCoach game="balloon" round={round} wrongHelp={feedback?.type === 'error'} />

      {feedback && <GameFeedbackPopup feedback={feedback} onDismiss={() => setFeedback(null)} />}

      <div className={shared.workBlock}>
        <GamePrompt icon="🎈" label={t('games.popPrompt')} theme="sky" variant="questionOnly">
          {prompt}
        </GamePrompt>

        <div
          className={`${shared.stage} ${shared.workBlockFollow} ${styles.skyStage}`}
          role="group"
          aria-label={t('games.popPrompt')}
        >
        <div className={styles.skyBg} />
        <span className={`${styles.cloudEmoji} ${styles.cloudSlow}`} style={{ top: '12%', left: '-5%' }}>
          ☁️
        </span>
        <span className={`${styles.cloudEmoji} ${styles.cloudFast}`} style={{ top: '22%', left: '-8%' }}>
          ☁️
        </span>
        <span className={styles.sunEmoji}>☀️</span>
        <span className={styles.grassEmoji}>🌿</span>

        {bursts.map((burst) => (
          <div
            key={burst.id}
            className={styles.popBurst}
            style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
            aria-hidden="true"
          >
            {burst.particles.map((particle) => (
              <span
                key={particle.id}
                className={particle.emoji ? styles.popEmoji : styles.popParticle}
                style={{
                  ...(particle.emoji
                    ? {}
                    : {
                        backgroundColor: particle.color,
                        width: particle.size,
                        height: particle.size * 0.65,
                      }),
                  ['--tx' as string]: `${particle.tx}px`,
                  ['--ty' as string]: `${particle.ty}px`,
                  animationDelay: `${particle.delay}s`,
                }}
              >
                {particle.emoji}
              </span>
            ))}
          </div>
        ))}

        {balloons.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`${styles.balloon} ${poppedId === b.id ? styles.popped : ''} ${shakingId === b.id ? styles.shake : ''}`}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              animationDuration: `${b.floatDuration}s`,
            }}
            onClick={() => handlePop(b)}
            disabled={locked}
            aria-label={`${b.value}`}
          >
            <span className={styles.balloonEmoji} aria-hidden="true">
              🎈
            </span>
            <span className={styles.balloonValue}>{b.value}</span>
          </button>
        ))}
      </div>
      </div>
    </div>
  );

  return isPreschool(gradeLevel) ? (
    <PreschoolShell banner={t('preschool.gamesBanner')}>{gameBody}</PreschoolShell>
  ) : (
    gameBody
  );
}

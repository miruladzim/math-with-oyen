import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { BigButton } from '../components/BigButton';
import { Confetti } from '../components/Confetti';
import { createGameFeedback, GameFeedbackPopup, type GameFeedback } from '../components/GameFeedbackPopup';
import { CORRECT_ADVANCE_MS, WRONG_FEEDBACK_MS } from '../lib/feedbackTiming';
import { GameHUD } from '../components/GameHUD';
import { GameCoach } from '../components/GameCoach';
import { GamePrompt } from '../components/GamePrompt';
import { VictoryScreen } from '../components/VictoryScreen';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { useConfettiBurst } from '../hooks/useConfettiBurst';
import { useGameRounds } from '../hooks/useGameRounds';
import { useGameTimers } from '../hooks/useGameTimers';
import { playCorrect, playIncorrect, playSuccess } from '../lib/audio';
import { getVictoryEncouragement, recordSession, starsFromAccuracy } from '../lib/progress';
import { generateFractionQuestion, parseFraction } from '../lib/questions/fractions';
import { speak } from '../lib/speech';
import { PizzaVisual } from './PizzaVisual';
import shared from './shared.module.css';
import styles from './FractionPizza.module.css';

interface FractionPizzaProps {
  onExit: () => void;
}

export function FractionPizza({ onExit }: FractionPizzaProps) {
  const { setProgress, progress } = useProgress();
  const { t, language } = useLanguage();
  const rounds = useGameRounds();
  const { schedule, clearAll } = useGameTimers();
  const confetti = useConfettiBurst();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [target, setTarget] = useState({ numer: 1, denom: 4 });
  const [filled, setFilled] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<GameFeedback | null>(null);
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(false);
  const [roundLocked, setRoundLocked] = useState(false);

  const startRound = useCallback(() => {
    const q = generateFractionQuestion(2, language);
    const { numer, denom } = parseFraction(String(q.correctAnswer));
    setTarget({ numer, denom });
    setFilled(Array(denom).fill(false));
    setFeedback(null);
    setChecking(false);
    setRoundLocked(false);
    speak(t('games.pizzaSpeech', { numer, denom }));
  }, [language, t]);

  useEffect(() => {
    if (!done) startRound();
  }, [round, startRound, done]);

  useEffect(() => clearAll, [clearAll]);

  const handleExit = () => {
    clearAll();
    confetti.clear();
    onExit();
  };

  const toggleSlice = (index: number) => {
    if (roundLocked || checking) return;
    setFilled((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const filledCount = filled.filter(Boolean).length;
  const sessionTotal = rounds + wrongCount;

  const checkAnswer = () => {
    if (checking || roundLocked) return;
    setChecking(true);

    if (filledCount === target.numer) {
      setCorrect((prev) => {
        const newCorrect = prev + 1;
        setRoundLocked(true);
        confetti.burst();
        setFeedback(createGameFeedback('success', t('games.pizzaPerfect')));
        speak(t('common.correct'));
        playCorrect();

        schedule(() => {
          if (round + 1 >= rounds) {
            setProgress(
              recordSession(progress, 'fractions', newCorrect, rounds + wrongCount),
            );
            playSuccess();
            setDone(true);
          } else {
            setRound((r) => r + 1);
          }
        }, CORRECT_ADVANCE_MS);

        return newCorrect;
      });
    } else {
      setWrongCount((w) => w + 1);
      setFeedback(
        createGameFeedback(
          'error',
          t('games.pizzaWrong', { count: filledCount, target: target.numer }),
        ),
      );
      speak(t('common.tryAgain'));
      playIncorrect();
      schedule(() => {
        setFeedback(null);
        setChecking(false);
      }, WRONG_FEEDBACK_MS);
    }
  };

  const stars = useMemo(
    () => starsFromAccuracy(correct, sessionTotal),
    [correct, sessionTotal],
  );
  const encouragementKey = getVictoryEncouragement(correct, sessionTotal);

  const restart = () => {
    clearAll();
    confetti.clear();
    setCorrect(0);
    setWrongCount(0);
    setDone(false);
    setRound(0);
  };

  if (done) {
    return (
      <VictoryScreen
        title={t('games.pizzaVictory')}
        encouragement={t(`victory.${encouragementKey}`)}
        subtitle={t('games.pizzaVictorySub', { correct, total: rounds })}
        stars={stars}
        onPlayAgain={restart}
        onExit={handleExit}
        backLabel={t('games.backGames')}
      />
    );
  }

  const controlsLocked = roundLocked || checking;

  return (
    <div className={shared.shell} data-play-session>
      <BackButton label={t('games.backGames')} onClick={handleExit} />
      <Confetti burstKey={confetti.burstKey} count={20} />
      <GameHUD
        icon="🍕"
        label={t('games.fractionPizza')}
        current={round + 1}
        total={rounds}
        score={correct}
      />

      <GameCoach game="pizza" round={round} wrongHelp={feedback?.type === 'error'} />

      {feedback && <GameFeedbackPopup feedback={feedback} onDismiss={() => setFeedback(null)} />}

      <div className={shared.workBlock}>
        <GamePrompt icon="🍕" label={t('games.pizzaPrompt')} theme="kitchen" variant="questionOnly">
          <span className={styles.fraction}>{target.numer}/{target.denom}</span>
          <p className={styles.hint}>{t('games.pizzaHint')}</p>
        </GamePrompt>

        <div className={`${styles.pizzaArea} ${shared.workBlockFollow}`}>
        <span className={styles.counter}>
          {t('games.pizzaSlices', { count: filledCount, target: target.numer })}
        </span>
        <PizzaVisual
          denom={target.denom}
          filled={filled}
          onToggle={toggleSlice}
          disabled={controlsLocked}
        />
        <div className={styles.controls}>
          <BigButton onClick={checkAnswer} disabled={controlsLocked}>
            ✅ {t('games.checkPizza')}
          </BigButton>
          <BigButton
            variant="outline"
            onClick={() => setFilled(Array(target.denom).fill(false))}
            disabled={controlsLocked}
          >
            🔄 {t('games.clear')}
          </BigButton>
        </div>
      </div>
      </div>
    </div>
  );
}

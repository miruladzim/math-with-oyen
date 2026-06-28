import { useCallback, useState } from 'react';
import { useConfettiBurst } from './useConfettiBurst';
import { useGameTimers } from './useGameTimers';
import { useLanguage } from '../context/LanguageContext';
import { LAB_ROUNDS } from '../lib/lab/labConfig';
import { pickEncouragement } from '../lib/hints';
import { getVictoryEncouragement, recordLabSession, starsFromAccuracy } from '../lib/progress';
import { playCorrect, playIncorrect, playSuccess } from '../lib/audio';
import { speak } from '../lib/speech';
import type { LabModeId } from '../lib/types';
import type { AppProgress } from '../lib/types';
import { createGameFeedback, type GameFeedback } from '../components/GameFeedbackPopup';

interface UseLabSessionOptions {
  modeId: LabModeId;
  progress: AppProgress;
  setProgress: (p: AppProgress) => void;
}

export function useLabSession({ modeId, progress, setProgress }: UseLabSessionOptions) {
  const { language } = useLanguage();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [combo, setCombo] = useState(0);
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<GameFeedback | null>(null);
  const [mistakeAlert, setMistakeAlert] = useState<string | null>(null);
  const [wrongHelp, setWrongHelp] = useState(false);
  /** Difficulty for the current round only — avoids mid-round challenge swaps. */
  const [roundDifficulty, setRoundDifficulty] = useState(2);
  const { schedule, clearAll } = useGameTimers();
  const confetti = useConfettiBurst();

  const sessionTotal = LAB_ROUNDS + wrongCount;
  const stars = starsFromAccuracy(correct, sessionTotal);
  const encouragementKey = getVictoryEncouragement(correct, sessionTotal);

  const finishSession = useCallback(
    (finalCorrect: number) => {
      setProgress(recordLabSession(progress, modeId, finalCorrect, LAB_ROUNDS + wrongCount));
      playSuccess();
      setDone(true);
    },
    [modeId, progress, setProgress, wrongCount],
  );

  const dismissFeedbackPopup = useCallback(() => {
    setFeedback(null);
  }, []);

  const handleCorrect = useCallback(
    (_message: string, explanation?: string) => {
      if (locked) return;
      setLocked(true);
      const struggled = consecutiveWrong >= 2;
      setConsecutiveWrong(0);
      setWrongHelp(false);
      setMistakeAlert(null);
      confetti.burst();
      playCorrect();
      const cheer = pickEncouragement(language, round + correct);
      const popupMessage = explanation ? `${cheer} ${explanation}` : cheer;
      setFeedback(createGameFeedback('success', popupMessage));
      speak(popupMessage);

      setCorrect((prev) => {
        const next = prev + 1;
        setCombo((c) => c + 1);
        schedule(() => {
          setRound((r) => {
            if (r + 1 >= LAB_ROUNDS) {
              finishSession(next);
              return r;
            }
            setRoundDifficulty(struggled ? 1 : 2);
            setLocked(false);
            setFeedback(null);
            return r + 1;
          });
        }, 1400);
        return next;
      });
    },
    [confetti, consecutiveWrong, correct, finishSession, language, locked, round, schedule],
  );

  const handleWrong = useCallback(
    (message: string, mistakeHint: string) => {
      if (locked) return;
      setLocked(true);
      setConsecutiveWrong((v) => v + 1);
      setWrongCount((w) => w + 1);
      setCombo(0);
      setWrongHelp(true);
      setMistakeAlert(mistakeHint);
      playIncorrect();
      setFeedback(createGameFeedback('error', message));
      speak(message);
      schedule(() => {
        setLocked(false);
        setFeedback(null);
      }, 900);
    },
    [locked, schedule],
  );

  const restart = useCallback(() => {
    clearAll();
    confetti.clear();
    setRound(0);
    setCorrect(0);
    setWrongCount(0);
    setConsecutiveWrong(0);
    setCombo(0);
    setRoundDifficulty(2);
    setDone(false);
    setLocked(false);
    setFeedback(null);
    setMistakeAlert(null);
    setWrongHelp(false);
  }, [clearAll, confetti]);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
    setMistakeAlert(null);
    setWrongHelp(false);
  }, []);

  return {
    round,
    correct,
    wrongCount,
    combo,
    done,
    locked,
    feedback,
    mistakeAlert,
    wrongHelp,
    roundDifficulty,
    stars,
    encouragementKey,
    confetti,
    schedule,
    clearAll,
    handleCorrect,
    handleWrong,
    restart,
    clearFeedback,
    dismissFeedbackPopup,
    rounds: LAB_ROUNDS,
  };
}

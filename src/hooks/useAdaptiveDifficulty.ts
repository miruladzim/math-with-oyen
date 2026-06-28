import { useCallback, useState } from 'react';

const MAX_DIFFICULTY = 3;
const MIN_DIFFICULTY = 1;

export interface AdaptiveDifficultyState {
  difficulty: number;
  streakCorrect: number;
  streakWrong: number;
  peakDifficulty: number;
}

export function createAdaptiveState(initialDifficulty = 1): AdaptiveDifficultyState {
  const d = Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, initialDifficulty));
  return { difficulty: d, streakCorrect: 0, streakWrong: 0, peakDifficulty: d };
}

export function applyAdaptiveAnswer(
  state: AdaptiveDifficultyState,
  correct: boolean,
): AdaptiveDifficultyState {
  if (correct) {
    let streakCorrect = state.streakCorrect + 1;
    let streakWrong = 0;
    let difficulty = state.difficulty;
    if (streakCorrect >= 3 && difficulty < MAX_DIFFICULTY) {
      difficulty++;
      streakCorrect = 0;
    }
    return {
      difficulty,
      streakCorrect,
      streakWrong,
      peakDifficulty: Math.max(state.peakDifficulty, difficulty),
    };
  }

  let streakWrong = state.streakWrong + 1;
  let streakCorrect = 0;
  let difficulty = state.difficulty;
  if (streakWrong >= 2 && difficulty > MIN_DIFFICULTY) {
    difficulty--;
    streakWrong = 0;
  }
  return {
    difficulty,
    streakCorrect,
    streakWrong,
    peakDifficulty: state.peakDifficulty,
  };
}

export function useAdaptiveDifficulty(initialDifficulty = 1) {
  const [state, setState] = useState<AdaptiveDifficultyState>(() =>
    createAdaptiveState(initialDifficulty),
  );

  const resetAdaptive = useCallback((startDifficulty = 1) => {
    setState(createAdaptiveState(startDifficulty));
  }, []);

  const recordAnswer = useCallback((correct: boolean) => {
    setState((prev) => applyAdaptiveAnswer(prev, correct));
  }, []);

  return { ...state, resetAdaptive, recordAnswer, setState };
}

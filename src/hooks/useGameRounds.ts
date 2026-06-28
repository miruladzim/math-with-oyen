import { getGameRounds } from '../lib/gameConfig';
import { useProgress } from '../context/ProgressContext';

export function useGameRounds(): number {
  const { gradeLevel } = useProgress();
  return getGameRounds(gradeLevel);
}

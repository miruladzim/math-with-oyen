import type { GradeLevel } from './types';
import { getGameRoundsForGrade } from './preschoolConfig';

export const NORMAL_ROUNDS = 8;

export const GRADE_GAME_PICK: Record<GradeLevel, string> = {
  preschool: 'dive',
  k1: 'balloon',
  grade2: 'dive',
  grade3: 'rocket',
  grade45: 'crystal',
};

export function getGameRounds(grade: GradeLevel = 'k1'): number {
  return getGameRoundsForGrade(grade);
}

export function gameDifficulty(wrongStreak: number, base = 2): number {
  if (wrongStreak >= 2) return 1;
  return base;
}

export function preschoolGameDifficulty(wrongStreak: number): number {
  return wrongStreak >= 2 ? 1 : 1;
}

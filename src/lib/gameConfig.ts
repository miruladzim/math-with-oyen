export const NORMAL_ROUNDS = 8;

export function getGameRounds(): number {
  return NORMAL_ROUNDS;
}

export function gameDifficulty(wrongStreak: number, base = 2): number {
  if (wrongStreak >= 2) return 1;
  return base;
}

export const GRADE_GAME_PICK: Record<string, string> = {
  k1: 'balloon',
  grade2: 'dive',
  grade3: 'rocket',
  grade45: 'crystal',
};

import type { GradeLevel } from './types';

export const PRESCHOOL_SESSION_SIZE = 5;
export const PRESCHOOL_LAB_ROUNDS = 5;
export const PRESCHOOL_GAME_ROUNDS = 5;

export const PRESCHOOL_GAMES = ['dive', 'match', 'balloon'] as const;
export type PreschoolGameId = (typeof PRESCHOOL_GAMES)[number];

export const VALID_GRADES: GradeLevel[] = [
  'preschool',
  'k1',
  'grade2',
  'grade3',
  'grade45',
];

export function isPreschool(grade: GradeLevel): boolean {
  return grade === 'preschool';
}

export function getPracticeSessionSize(grade: GradeLevel): number {
  return isPreschool(grade) ? PRESCHOOL_SESSION_SIZE : 10;
}

export function getLabRounds(grade: GradeLevel): number {
  return isPreschool(grade) ? PRESCHOOL_LAB_ROUNDS : 6;
}

export function getGameRoundsForGrade(grade: GradeLevel): number {
  return isPreschool(grade) ? PRESCHOOL_GAME_ROUNDS : 8;
}

export function getGamesForGrade(grade: GradeLevel): readonly string[] {
  if (isPreschool(grade)) return PRESCHOOL_GAMES;
  return ['balloon', 'rocket', 'dive', 'crystal', 'match', 'pizza'];
}

export function parseCountingVisual(prompt: string): string[] {
  const lines = prompt.split('\n');
  if (lines.length < 2) return [];
  return lines[1].trim().split(/\s+/).filter(Boolean);
}

export function isTapCountTopic(topicId: string): boolean {
  return topicId === 'counting' || topicId === 'shapes';
}

export function isCompareTopic(topicId: string): boolean {
  return topicId === 'compare';
}

export function isPatternTopic(topicId: string): boolean {
  return topicId === 'patterns';
}

export function getPreschoolGameTopic(gameId: string): 'counting' | 'shapes' | 'addSub10' {
  if (gameId === 'dive' || gameId === 'balloon') return 'counting';
  if (gameId === 'match') return 'shapes';
  return 'counting';
}

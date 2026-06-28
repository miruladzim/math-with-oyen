import type { LabModeId } from '../../types';

export interface LabChallengeBase {
  id: string;
  modeId: LabModeId;
  difficulty: 1 | 2 | 3;
  prompt: string;
  explanation: string;
  mistakeHints: string[];
  strategyPrompt: string;
  steps: string[];
}

export interface NumberLineChallenge extends LabChallengeBase {
  modeId: 'numberLine';
  start: number;
  target: number;
  min: number;
  max: number;
}

export interface EquationBuilderChallenge extends LabChallengeBase {
  modeId: 'equationBuilder';
  leftA: number | null;
  leftB: number;
  result: number;
  missingSlot: 'leftA';
  tiles: number[];
  correctTile: number;
}

export interface BalanceScaleChallenge extends LabChallengeBase {
  modeId: 'balanceScale';
  targetLeft: number;
  targetRight: number;
  blockValues: number[];
}

export interface PatternStudioChallenge extends LabChallengeBase {
  modeId: 'patternStudio';
  sequence: string[];
  correctAnswer: string;
  tileOptions: string[];
  gapIndex: number;
}

export interface SortSquadChallenge extends LabChallengeBase {
  modeId: 'sortSquad';
  cards: { id: string; label: string; binId: string }[];
  bins: { id: string; label: string }[];
}

export interface ThinkStepsChallenge extends LabChallengeBase {
  modeId: 'thinkSteps';
  story: string;
  numbers: number[];
  operation: 'add' | 'sub' | 'mult';
  correctAnswer: number;
}

export type LabChallenge =
  | NumberLineChallenge
  | EquationBuilderChallenge
  | BalanceScaleChallenge
  | PatternStudioChallenge
  | SortSquadChallenge
  | ThinkStepsChallenge;

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

export interface TapGardenChallenge extends LabChallengeBase {
  modeId: 'tapGarden';
  items: string[];
  correctCount: number;
  choices: number[];
}

export interface CompareCoveChallenge extends LabChallengeBase {
  modeId: 'compareCove';
  emoji: string;
  groupA: number;
  groupB: number;
  askBigger: boolean;
  correctAnswer: number;
  choices: number[];
}

export interface ShapeMatchChallenge extends LabChallengeBase {
  modeId: 'shapeMatch';
  shapeEmoji: string;
  shapeKey: 'circles' | 'squares' | 'triangles' | 'stars';
  bins: { id: string; label: string }[];
  correctBinId: string;
}

export interface StoryWalkBeat {
  text: string;
  items: string[];
  correctCount: number;
  choices: number[];
}

export interface StoryWalkChallenge extends LabChallengeBase {
  modeId: 'storyWalk';
  name: string;
  beats: StoryWalkBeat[];
}

export interface NumberTraceChallenge extends LabChallengeBase {
  modeId: 'numberTrace';
  digit: number;
  dots: { x: number; y: number }[];
}

export interface PuzzlePatchChallenge extends LabChallengeBase {
  modeId: 'puzzlePatch';
  grid: string[][];
  missingRow: number;
  missingCol: number;
  pieceOptions: string[];
  correctPiece: string;
}

export type LabChallenge =
  | TapGardenChallenge
  | CompareCoveChallenge
  | ShapeMatchChallenge
  | StoryWalkChallenge
  | NumberTraceChallenge
  | PuzzlePatchChallenge
  | NumberLineChallenge
  | EquationBuilderChallenge
  | BalanceScaleChallenge
  | PatternStudioChallenge
  | SortSquadChallenge
  | ThinkStepsChallenge;

import type { GradeLevel, LabModeId, TopicId } from '../types';

export const LAB_ROUNDS = 6;

export interface LabModeMeta {
  id: LabModeId;
  emoji: string;
  grades: GradeLevel[];
  topicForProgress: TopicId;
  theme:
    | 'path'
    | 'workshop'
    | 'scale'
    | 'studio'
    | 'sort'
    | 'steps'
    | 'garden'
    | 'cove'
    | 'match'
    | 'story'
    | 'trace'
    | 'puzzle';
}

export const LAB_MODES: LabModeMeta[] = [
  {
    id: 'tapGarden',
    emoji: '🌻',
    grades: ['preschool'],
    topicForProgress: 'counting',
    theme: 'garden',
  },
  {
    id: 'numberTrace',
    emoji: '✏️',
    grades: ['preschool'],
    topicForProgress: 'counting',
    theme: 'trace',
  },
  {
    id: 'compareCove',
    emoji: '🐚',
    grades: ['preschool'],
    topicForProgress: 'compare',
    theme: 'cove',
  },
  {
    id: 'shapeMatch',
    emoji: '🔷',
    grades: ['preschool'],
    topicForProgress: 'shapes',
    theme: 'match',
  },
  {
    id: 'storyWalk',
    emoji: '📖',
    grades: ['preschool'],
    topicForProgress: 'wordProblems',
    theme: 'story',
  },
  {
    id: 'puzzlePatch',
    emoji: '🧩',
    grades: ['preschool'],
    topicForProgress: 'patterns',
    theme: 'puzzle',
  },
  {
    id: 'patternStudio',
    emoji: '🎨',
    grades: ['preschool', 'k1', 'grade2'],
    topicForProgress: 'skipCounting',
    theme: 'studio',
  },
  {
    id: 'numberLine',
    emoji: '📏',
    grades: ['preschool', 'k1', 'grade2'],
    topicForProgress: 'addSub10',
    theme: 'path',
  },
  {
    id: 'equationBuilder',
    emoji: '🧩',
    grades: ['k1', 'grade2', 'grade3'],
    topicForProgress: 'addSub10',
    theme: 'workshop',
  },
  {
    id: 'balanceScale',
    emoji: '⚖️',
    grades: ['k1', 'grade3'],
    topicForProgress: 'multiplication',
    theme: 'scale',
  },
  {
    id: 'sortSquad',
    emoji: '🗂️',
    grades: ['preschool', 'grade2', 'grade45'],
    topicForProgress: 'addSub100',
    theme: 'sort',
  },
  {
    id: 'thinkSteps',
    emoji: '🧠',
    grades: ['grade2', 'grade3', 'grade45'],
    topicForProgress: 'wordProblems',
    theme: 'steps',
  },
];

export function getLabModesForGrade(grade: GradeLevel): LabModeMeta[] {
  return LAB_MODES.filter((mode) => mode.grades.includes(grade));
}

export function getLabModeMeta(id: LabModeId): LabModeMeta {
  return LAB_MODES.find((mode) => mode.id === id) ?? LAB_MODES[0];
}

export const VALID_LAB_MODES: LabModeId[] = LAB_MODES.map((m) => m.id);

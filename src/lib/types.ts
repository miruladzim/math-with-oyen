import type { Language } from './i18n/types';

export type GradeLevel = 'preschool' | 'k1' | 'grade2' | 'grade3' | 'grade45';

export type LabModeId =
  | 'tapGarden'
  | 'numberLine'
  | 'equationBuilder'
  | 'balanceScale'
  | 'patternStudio'
  | 'sortSquad'
  | 'thinkSteps'
  | 'compareCove'
  | 'shapeMatch'
  | 'storyWalk'
  | 'numberTrace'
  | 'puzzlePatch';

export type TopicId =
  | 'counting'
  | 'shapes'
  | 'addSub10'
  | 'addSub100'
  | 'skipCounting'
  | 'wordProblems'
  | 'multiplication'
  | 'division'
  | 'multiDigit'
  | 'fractions'
  | 'compare'
  | 'numberBonds'
  | 'placeValue'
  | 'patterns';

export interface TopicInfo {
  id: TopicId;
  label: string;
  emoji: string;
}

export interface PreschoolVisualMeta {
  kind: 'compare' | 'pattern';
  emoji?: string;
  groupA?: number;
  groupB?: number;
  sequence?: string[];
  askBigger?: boolean;
}

export interface Question {
  id: string;
  topicId: TopicId;
  prompt: string;
  correctAnswer: number | string;
  choices?: (number | string)[];
  inputType: 'choice' | 'number';
  difficulty: number;
  hint?: string;
  visualMeta?: PreschoolVisualMeta;
}

export interface TopicProgress {
  stars: 0 | 1 | 2 | 3;
  totalAnswered: number;
  totalCorrect: number;
  lastPlayed?: string;
  masteryLevel?: 0 | 1 | 2 | 3;
  savedDifficulty?: 1 | 2 | 3;
  perfectSessions?: number;
  sessionsAt80?: number;
}

export interface LabModeProgress {
  stars: 0 | 1 | 2 | 3;
  sessionsCompleted: number;
  bestAccuracy: number;
}

export interface AppSettings {
  speechEnabled: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
  teacherPin: string;
  language: Language;
  onboardingDone: boolean;
  pinHintDismissed: boolean;
}

export interface FinalExamProgress {
  attempts: number;
  bestCorrect: number;
  bestTotal: number;
  bestStars: 0 | 1 | 2 | 3;
  lastAttempt?: string;
  passed: boolean;
}

export interface AppProgress {
  gradeLevel: GradeLevel;
  studentName: string;
  topics: Partial<Record<TopicId, TopicProgress>>;
  labModes: Partial<Record<LabModeId, LabModeProgress>>;
  finalExams?: Partial<Record<GradeLevel, FinalExamProgress>>;
  badges: string[];
  streak: number;
  lastPlayedDate?: string;
  weekStartDate?: string;
  weeklyAnswered: number;
  weeklyCorrect: number;
  settings: AppSettings;
}

export const GRADE_LABELS: Record<GradeLevel, string> = {
  preschool: 'Preschool (Ages 5–6)',
  k1: 'Sprout (K–1)',
  grade2: 'Explorer (Grade 2)',
  grade3: 'Builder (Grade 3)',
  grade45: 'Champion (Grades 4–5)',
};

export const GRADE_DESCRIPTIONS: Record<GradeLevel, string> = {
  preschool: 'Play-based counting, shapes, compare, and patterns',
  k1: 'Counting, shapes, and add/sub within 10',
  grade2: 'Add/sub within 100, skip counting, word problems',
  grade3: 'Multiplication tables and intro division',
  grade45: 'Multi-digit ops and fractions',
};

export const BADGE_DEFINITIONS: Record<string, { label: string; emoji: string }> = {
  first_star: { label: 'First Star', emoji: '⭐' },
  ten_questions: { label: '10 Questions', emoji: '🎯' },
  fifty_questions: { label: '50 Questions', emoji: '🏅' },
  perfect_score: { label: 'Perfect Score', emoji: '💯' },
  streak_3: { label: '3-Day Streak', emoji: '🔥' },
  streak_10: { label: '10-Day Streak', emoji: '🌟' },
  multiplication_master: { label: 'Multiplication Master', emoji: '✖️' },
  fraction_friend: { label: 'Fraction Friend', emoji: '🍕' },
  lab_explorer: { label: 'Lab Explorer', emoji: '🧪' },
  lab_streak_3: { label: 'Lab Streak', emoji: '🔬' },
  lab_perfect: { label: 'Lab Perfect', emoji: '💡' },
  exam_graduate: { label: 'Exam Graduate', emoji: '🎓' },
};

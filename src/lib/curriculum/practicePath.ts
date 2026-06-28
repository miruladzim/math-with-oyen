import type { GradeLevel, LabModeId, TopicId } from '../types';

export type PracticeUnitRole = 'core' | 'review' | 'stretch';

export interface PracticeUnit {
  topicId: TopicId;
  role: PracticeUnitRole;
  labModeId?: LabModeId;
  /** Cap number-bond target (e.g. 20 for review in grade 3) */
  bondTargetMax?: number;
}

const PRACTICE_PATH: Record<GradeLevel, PracticeUnit[]> = {
  k1: [
    { topicId: 'counting', role: 'core', labModeId: 'numberLine' },
    { topicId: 'shapes', role: 'core' },
    { topicId: 'compare', role: 'core' },
    { topicId: 'addSub10', role: 'core', labModeId: 'numberLine' },
    { topicId: 'numberBonds', role: 'core', labModeId: 'equationBuilder' },
    { topicId: 'patterns', role: 'core', labModeId: 'patternStudio' },
    { topicId: 'skipCounting', role: 'review', labModeId: 'patternStudio' },
  ],
  grade2: [
    { topicId: 'addSub100', role: 'core', labModeId: 'sortSquad' },
    { topicId: 'placeValue', role: 'core', labModeId: 'sortSquad' },
    { topicId: 'compare', role: 'review' },
    { topicId: 'numberBonds', role: 'core', labModeId: 'equationBuilder' },
    { topicId: 'patterns', role: 'core', labModeId: 'patternStudio' },
    { topicId: 'skipCounting', role: 'core', labModeId: 'patternStudio' },
    { topicId: 'wordProblems', role: 'core', labModeId: 'thinkSteps' },
  ],
  grade3: [
    { topicId: 'multiplication', role: 'core', labModeId: 'balanceScale' },
    { topicId: 'division', role: 'core', labModeId: 'balanceScale' },
    { topicId: 'addSub100', role: 'review', labModeId: 'sortSquad' },
    { topicId: 'placeValue', role: 'core', labModeId: 'sortSquad' },
    { topicId: 'wordProblems', role: 'core', labModeId: 'thinkSteps' },
    { topicId: 'patterns', role: 'review', labModeId: 'patternStudio' },
    { topicId: 'numberBonds', role: 'review', labModeId: 'equationBuilder', bondTargetMax: 20 },
  ],
  grade45: [
    { topicId: 'multiDigit', role: 'core' },
    { topicId: 'fractions', role: 'core' },
    { topicId: 'multiplication', role: 'review', labModeId: 'balanceScale' },
    { topicId: 'division', role: 'review', labModeId: 'balanceScale' },
    { topicId: 'placeValue', role: 'review', labModeId: 'sortSquad' },
    { topicId: 'wordProblems', role: 'core', labModeId: 'thinkSteps' },
    { topicId: 'patterns', role: 'stretch', labModeId: 'patternStudio' },
  ],
};

export function getPracticePath(grade: GradeLevel): PracticeUnit[] {
  return PRACTICE_PATH[grade];
}

export function getPracticeUnit(grade: GradeLevel, topicId: TopicId): PracticeUnit | undefined {
  return PRACTICE_PATH[grade].find((unit) => unit.topicId === topicId);
}

export function getTopicIdsForGrade(grade: GradeLevel): TopicId[] {
  return PRACTICE_PATH[grade].map((unit) => unit.topicId);
}

export type TopicBadge = 'new' | 'review' | 'strong' | null;

export function getTopicBadge(
  role: PracticeUnitRole,
  stars: number,
  totalAnswered: number,
): TopicBadge {
  if (totalAnswered === 0) return 'new';
  if (stars >= 2) return 'strong';
  if (role === 'review' && totalAnswered > 0) return 'review';
  return null;
}

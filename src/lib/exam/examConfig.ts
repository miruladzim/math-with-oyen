import type { GradeLevel } from '../types';

export const EXAM_SECTIONS = 3;
export const QUESTIONS_PER_SECTION = 5;
export const EXAM_TOTAL_QUESTIONS = EXAM_SECTIONS * QUESTIONS_PER_SECTION;

export const EXAM_PASS_THRESHOLD = 0.6;
export const EXAM_GRADUATE_THRESHOLD = 0.8;

export interface ExamSectionConfig {
  id: string;
  labelKey: 'exam.sections.warmUp' | 'exam.sections.challenge' | 'exam.sections.finalStretch';
  difficulty: 1 | 2 | 3;
  themeClass: 'warm' | 'cool' | 'gold';
}

export const EXAM_SECTION_CONFIG: ExamSectionConfig[] = [
  {
    id: 'warmUp',
    labelKey: 'exam.sections.warmUp',
    difficulty: 1,
    themeClass: 'warm',
  },
  {
    id: 'challenge',
    labelKey: 'exam.sections.challenge',
    difficulty: 2,
    themeClass: 'cool',
  },
  {
    id: 'finalStretch',
    labelKey: 'exam.sections.finalStretch',
    difficulty: 3,
    themeClass: 'gold',
  },
];

export function getExamSectionConfig(sectionIndex: number): ExamSectionConfig {
  return EXAM_SECTION_CONFIG[sectionIndex] ?? EXAM_SECTION_CONFIG[0];
}

export function formatExamDate(date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export type ExamGradeKey = GradeLevel;

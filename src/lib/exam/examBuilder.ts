import type { Language } from '../i18n/types';
import { getPracticePath, getPracticeUnit, type PracticeUnitRole } from '../curriculum/practicePath';
import { generateQuestion, type GenerateOptions } from '../questions';
import type { GradeLevel, Question, TopicId } from '../types';
import {
  EXAM_SECTION_CONFIG,
  EXAM_TOTAL_QUESTIONS,
  QUESTIONS_PER_SECTION,
} from './examConfig';

const TOPIC_EMOJI: Record<TopicId, string> = {
  counting: '🔢',
  shapes: '🔷',
  addSub10: '➕',
  addSub100: '🧮',
  skipCounting: '⏭️',
  wordProblems: '📝',
  multiplication: '✖️',
  division: '➗',
  multiDigit: '💪',
  fractions: '🍕',
  compare: '🆚',
  numberBonds: '🔗',
  placeValue: '🏠',
  patterns: '🔁',
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeChoices(correct: number, count: number, spread: number): number[] {
  const choices = new Set<number>([correct]);
  let guard = 0;
  while (choices.size < count && guard < 50) {
    guard += 1;
    const offset = randInt(-spread, spread);
    const candidate = correct + offset;
    if (candidate >= 0 && candidate !== correct) {
      choices.add(candidate);
    }
  }
  while (choices.size < count) {
    choices.add(correct + choices.size);
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

export function ensureChoiceQuestion(
  topicId: TopicId,
  difficulty: 1 | 2 | 3,
  lang: Language,
  options?: GenerateOptions,
): Question {
  const attempts = [difficulty, 1, 2] as const;
  for (const d of attempts) {
    const question = generateQuestion(topicId, d, lang, options);
    if (question.inputType === 'choice' && question.choices && question.choices.length >= 4) {
      return question;
    }
  }

  const fallback = generateQuestion(topicId, 1, lang, options);
  if (typeof fallback.correctAnswer === 'number') {
    const spread = Math.max(5, Math.abs(fallback.correctAnswer));
    return {
      ...fallback,
      inputType: 'choice',
      choices: makeChoices(fallback.correctAnswer, 4, spread),
    };
  }

  return {
    ...fallback,
    inputType: 'choice',
    choices: [fallback.correctAnswer, '?', '—', '…'].slice(0, 4),
  };
}

export interface ExamQuestion extends Question {
  sectionIndex: number;
  topicEmoji: string;
}

export interface ExamSection {
  id: string;
  difficulty: 1 | 2 | 3;
  questions: ExamQuestion[];
}

export interface ExamPaper {
  grade: GradeLevel;
  sections: ExamSection[];
  questions: ExamQuestion[];
}

function rolesForSection(sectionIndex: number): PracticeUnitRole[] {
  if (sectionIndex === 0) return ['core'];
  if (sectionIndex === 1) return ['core', 'review'];
  return ['core', 'review', 'stretch'];
}

function pickTopicsForSection(
  path: ReturnType<typeof getPracticePath>,
  sectionIndex: number,
  count: number,
  startOffset: number,
): TopicId[] {
  const allowedRoles = rolesForSection(sectionIndex);
  const pool = path.filter((unit) => allowedRoles.includes(unit.role));
  const fallback = path.length > 0 ? path : [{ topicId: 'counting' as TopicId, role: 'core' as const }];
  const source = pool.length > 0 ? pool : fallback;

  return Array.from({ length: count }, (_, i) => {
    const unit = source[(startOffset + i) % source.length];
    return unit.topicId;
  });
}

function uniqueQuestion(
  grade: GradeLevel,
  topicId: TopicId,
  difficulty: 1 | 2 | 3,
  lang: Language,
  usedPrompts: Set<string>,
): Question {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const unit = getPracticeUnit(grade, topicId);
    const options =
      unit?.bondTargetMax !== undefined ? { bondTargetMax: unit.bondTargetMax } : undefined;
    const question = ensureChoiceQuestion(topicId, difficulty, lang, options);
    if (!usedPrompts.has(question.prompt)) {
      usedPrompts.add(question.prompt);
      return question;
    }
  }
  const question = ensureChoiceQuestion(topicId, difficulty, lang);
  usedPrompts.add(question.prompt);
  return question;
}

export function buildFinalExam(grade: GradeLevel, lang: Language = 'en'): ExamPaper {
  const path = getPracticePath(grade);
  const usedPrompts = new Set<string>();
  const sections: ExamSection[] = EXAM_SECTION_CONFIG.map((config, sectionIndex) => {
    const topicIds = pickTopicsForSection(path, sectionIndex, QUESTIONS_PER_SECTION, sectionIndex);
    const questions: ExamQuestion[] = topicIds.map((topicId) => {
      const unit = getPracticeUnit(grade, topicId);
      const options = unit?.bondTargetMax ? { bondTargetMax: unit.bondTargetMax } : undefined;
      let question = ensureChoiceQuestion(topicId, config.difficulty, lang, options);
      if (usedPrompts.has(question.prompt)) {
        question = uniqueQuestion(grade, topicId, config.difficulty, lang, usedPrompts);
      } else {
        usedPrompts.add(question.prompt);
      }
      return {
        ...question,
        id: `${grade}-${sectionIndex}-${topicId}-${question.id}`,
        sectionIndex,
        topicEmoji: TOPIC_EMOJI[topicId],
      };
    });

    return {
      id: config.id,
      difficulty: config.difficulty,
      questions,
    };
  });

  const questions = sections.flatMap((section) => section.questions);

  return {
    grade,
    sections,
    questions: questions.slice(0, EXAM_TOTAL_QUESTIONS),
  };
}

export function getTopicEmoji(topicId: TopicId): string {
  return TOPIC_EMOJI[topicId];
}

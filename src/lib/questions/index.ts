import type { Language } from '../i18n/types';
import type { GradeLevel, Question, TopicId, TopicInfo } from '../types';
import {
  generateAddSub10Question,
  generateAddSub100Question,
  generateMultiDigitQuestion,
  generateSkipCountingQuestion,
  generateWordProblemQuestion,
} from './addSub';
import {
  generateCompareQuestion,
  generateNumberBondsQuestion,
  generatePatternsQuestion,
  generatePlaceValueQuestion,
} from './basics';
import { generateCountingQuestion, generateShapesQuestion } from './counting';
import { generateDivisionQuestion } from './divide';
import { parseFraction, generateFractionQuestion } from './fractions';
import { generateMultiplicationQuestion } from './multiply';
import { getTopicIdsForGrade } from '../curriculum/practicePath';
import { getTopicLabel } from '../i18n/translations';

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

const GRADE_TOPICS: Record<GradeLevel, TopicId[]> = {
  preschool: getTopicIdsForGrade('preschool'),
  k1: getTopicIdsForGrade('k1'),
  grade2: getTopicIdsForGrade('grade2'),
  grade3: getTopicIdsForGrade('grade3'),
  grade45: getTopicIdsForGrade('grade45'),
};

export interface GenerateOptions {
  bondTargetMax?: number;
  preschool?: boolean;
}

type Generator = (
  difficulty: number,
  lang: Language,
  options?: GenerateOptions & { preschool?: boolean },
) => Question;

const GENERATORS: Record<TopicId, Generator> = {
  counting: generateCountingQuestion,
  shapes: generateShapesQuestion,
  addSub10: generateAddSub10Question,
  addSub100: generateAddSub100Question,
  skipCounting: generateSkipCountingQuestion,
  wordProblems: generateWordProblemQuestion,
  multiplication: generateMultiplicationQuestion,
  division: generateDivisionQuestion,
  multiDigit: generateMultiDigitQuestion,
  fractions: generateFractionQuestion,
  compare: generateCompareQuestion,
  numberBonds: (d, lang) => generateNumberBondsQuestion(d, lang),
  placeValue: generatePlaceValueQuestion,
  patterns: generatePatternsQuestion,
};

export function getTopicsForGrade(grade: GradeLevel, lang: Language = 'en'): TopicInfo[] {
  return GRADE_TOPICS[grade].map((id) => ({
    id,
    label: getTopicLabel(lang, id),
    emoji: TOPIC_EMOJI[id],
  }));
}

export function getAllTopics(lang: Language = 'en'): TopicInfo[] {
  return (Object.keys(TOPIC_EMOJI) as TopicId[]).map((id) => ({
    id,
    label: getTopicLabel(lang, id),
    emoji: TOPIC_EMOJI[id],
  }));
}

export function generateQuestion(
  topicId: TopicId,
  difficulty: number,
  lang: Language = 'en',
  options?: GenerateOptions,
): Question {
  const d = Math.max(1, Math.min(3, difficulty));
  if (topicId === 'numberBonds') {
    return generateNumberBondsQuestion(d, lang, options?.bondTargetMax);
  }
  if (options?.preschool && (topicId === 'counting' || topicId === 'shapes' || topicId === 'compare' || topicId === 'patterns')) {
    return GENERATORS[topicId](d, lang, { preschool: true });
  }
  return GENERATORS[topicId](d, lang, options);
}

export function generateQuestions(
  topicId: TopicId,
  count: number,
  startDifficulty = 1,
  lang: Language = 'en',
): Question[] {
  return Array.from({ length: count }, () =>
    generateQuestion(topicId, startDifficulty, lang),
  );
}

export function generateAdaptiveQuestions(
  topicId: TopicId,
  count: number,
  startDifficulty = 1,
  lang: Language = 'en',
): { questions: Question[]; onAnswer: (correct: boolean) => void } {
  let difficulty = startDifficulty;
  let streakCorrect = 0;
  let streakWrong = 0;
  const questions: Question[] = [];

  for (let i = 0; i < count; i++) {
    questions.push(generateQuestion(topicId, difficulty, lang));
  }

  const onAnswer = (correct: boolean) => {
    if (correct) {
      streakCorrect++;
      streakWrong = 0;
      if (streakCorrect >= 3 && difficulty < 3) {
        difficulty++;
        streakCorrect = 0;
      }
    } else {
      streakWrong++;
      streakCorrect = 0;
      if (streakWrong >= 2 && difficulty > 1) {
        difficulty--;
        streakWrong = 0;
      }
    }
  };

  return { questions, onAnswer };
}

export function checkAnswer(question: Question, answer: string | number): boolean {
  const normalized =
    typeof question.correctAnswer === 'number'
      ? Number(answer)
      : String(answer).trim();

  if (typeof question.correctAnswer === 'number') {
    return normalized === question.correctAnswer;
  }

  return String(normalized) === question.correctAnswer;
}

export function generateWorksheetQuestions(
  topicId: TopicId,
  count: number,
  difficulty = 2,
  lang: Language = 'en',
): Question[] {
  return Array.from({ length: count }, () =>
    generateQuestion(topicId, difficulty, lang),
  );
}

export { parseFraction };

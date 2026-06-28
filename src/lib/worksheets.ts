import type { Language } from './i18n/types';
import { getGradeLabel, getTopicLabel } from './i18n/translations';
import type { GradeLevel, Question, TopicId } from './types';
import { generateWorksheetQuestions } from './questions';

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

export interface WorksheetData {
  title: string;
  grade: GradeLevel;
  topicId: TopicId;
  questions: Question[];
  createdAt: string;
}

export function createWorksheet(
  grade: GradeLevel,
  topicId: TopicId,
  count: 10 | 20 | 30,
  lang: Language = 'en',
  practiceSuffix = 'Practice',
): WorksheetData {
  const emoji = TOPIC_EMOJI[topicId];
  const label = getTopicLabel(lang, topicId);
  return {
    title: `${emoji} ${label} ${practiceSuffix}`,
    grade,
    topicId,
    questions: generateWorksheetQuestions(topicId, count, 2, lang),
    createdAt: new Date().toLocaleDateString(lang === 'ms' ? 'ms-MY' : 'en-MY'),
  };
}

export function formatQuestionForPrint(question: Question, index: number): string {
  const prompt = question.prompt.replace(/\n/g, ' ');
  if (question.inputType === 'choice') {
    return `${index + 1}. ${prompt}`;
  }
  return `${index + 1}. ${prompt} ______`;
}

export { getGradeLabel };

import type { Language } from '../i18n/types';
import type { Question } from '../types';
import { getQuestionStrings, interpolate, pickRandom } from '../i18n/translations';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeChoices(correct: number, count: number, spread: number): number[] {
  const choices = new Set<number>([correct]);
  while (choices.size < count) {
    const candidate = correct + randInt(-spread, spread);
    if (candidate >= 0 && candidate !== correct) {
      choices.add(candidate);
    }
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

function makeWordProblemChoices(correct: number, isAdd: boolean, a: number, b: number): number[] {
  const choices = new Set<number>([correct]);
  const wrongOp = isAdd ? a - b : a + b;
  if (wrongOp >= 0) choices.add(wrongOp);
  if (a >= 0) choices.add(a);
  if (b >= 0) choices.add(b);
  while (choices.size < 4) {
    const candidate = correct + randInt(-3, 3);
    if (candidate >= 0) choices.add(candidate);
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

const ITEM_KEYS = ['stickers', 'marbles', 'books', 'cookies', 'pencils'] as const;

function formatExpr(qs: ReturnType<typeof getQuestionStrings>, a: number, op: string, b: number): string {
  return qs.exprPrompt
    .replace('{a}', String(a))
    .replace('{op}', op)
    .replace('{b}', String(b));
}

export function generateAddSub10Question(difficulty: number, lang: Language = 'en'): Question {
  const qs = getQuestionStrings(lang);
  const max = difficulty === 1 ? 5 : difficulty === 2 ? 8 : 10;
  const isAdd = Math.random() > 0.4;
  let a = randInt(1, max);
  let b = randInt(1, max);

  if (!isAdd && a < b) [a, b] = [b, a];

  const correct = isAdd ? a + b : a - b;
  const op = isAdd ? '+' : '−';

  return {
    id: crypto.randomUUID(),
    topicId: 'addSub10',
    prompt: formatExpr(qs, a, op, b),
    correctAnswer: correct,
    choices: makeChoices(correct, 4, 3),
    inputType: 'choice',
    difficulty,
  };
}

export function generateAddSub100Question(difficulty: number, lang: Language = 'en'): Question {
  const qs = getQuestionStrings(lang);
  const max = difficulty === 1 ? 20 : difficulty === 2 ? 50 : 100;
  const isAdd = Math.random() > 0.45;
  let a = randInt(10, max);
  let b = randInt(1, isAdd ? max - a : a);

  if (!isAdd && a < b) [a, b] = [b, a];

  const correct = isAdd ? a + b : a - b;
  const op = isAdd ? '+' : '−';

  return {
    id: crypto.randomUUID(),
    topicId: 'addSub100',
    prompt: formatExpr(qs, a, op, b),
    correctAnswer: correct,
    inputType: difficulty === 1 ? 'choice' : 'number',
    choices: difficulty === 1 ? makeChoices(correct, 4, 5) : undefined,
    difficulty,
  };
}

export function generateSkipCountingQuestion(difficulty: number, lang: Language = 'en'): Question {
  const qs = getQuestionStrings(lang);
  const step = difficulty === 1 ? 2 : difficulty === 2 ? 5 : 10;
  const start = randInt(0, step);
  const sequence = [start, start + step, start + step * 2];
  const correct = start + step * 3;

  return {
    id: crypto.randomUUID(),
    topicId: 'skipCounting',
    prompt: `${qs.skipBy.replace('{step}', String(step))}\n${sequence.join(', ')}, ?`,
    correctAnswer: correct,
    choices: makeChoices(correct, 4, step),
    inputType: 'choice',
    difficulty,
  };
}

export function generateWordProblemQuestion(difficulty: number, lang: Language = 'en'): Question {
  const qs = getQuestionStrings(lang);
  const name = pickRandom(qs.names);
  const itemKey = ITEM_KEYS[randInt(0, ITEM_KEYS.length - 1)];
  const item = qs.items[itemKey];
  const max = difficulty === 1 ? 10 : difficulty === 2 ? 20 : 50;

  const isAdd = Math.random() > 0.5;
  let a = randInt(2, max / 2);
  let b = randInt(1, max / 2);
  let prompt: string;
  let correct: number;

  if (isAdd) {
    correct = a + b;
    prompt = interpolate(qs.wordAdd, { name, a, b, item });
  } else {
    if (a < b) [a, b] = [b, a];
    correct = a - b;
    prompt = interpolate(qs.wordSub, { name, a, b, item });
  }

  const useChoices = difficulty <= 2;

  return {
    id: crypto.randomUUID(),
    topicId: 'wordProblems',
    prompt,
    correctAnswer: correct,
    inputType: useChoices ? 'choice' : 'number',
    choices: useChoices ? makeWordProblemChoices(correct, isAdd, a, b) : undefined,
    difficulty,
    hint: isAdd ? qs.wordProblemAddHint : qs.wordProblemSubHint,
  };
}

export function generateMultiDigitQuestion(difficulty: number, lang: Language = 'en'): Question {
  const qs = getQuestionStrings(lang);
  const isAdd = Math.random() > 0.5;
  let a: number;
  let b: number;

  if (difficulty === 1) {
    a = randInt(10, 99);
    b = randInt(10, 99);
  } else if (difficulty === 2) {
    a = randInt(100, 499);
    b = randInt(10, 499);
  } else {
    a = randInt(100, 999);
    b = randInt(100, 999);
  }

  if (!isAdd && a < b) [a, b] = [b, a];

  const correct = isAdd ? a + b : a - b;
  const op = isAdd ? '+' : '−';

  return {
    id: crypto.randomUUID(),
    topicId: 'multiDigit',
    prompt: formatExpr(qs, a, op, b),
    correctAnswer: correct,
    inputType: 'number',
    difficulty,
  };
}

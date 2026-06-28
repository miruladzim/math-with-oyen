import type { Language } from '../i18n/types';
import type { Question } from '../types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeMultChoices(a: number, b: number, correct: number): number[] {
  const choices = new Set<number>([correct]);
  choices.add(a + b);
  if (b > 1) choices.add(a * (b - 1));
  if (a > 1) choices.add((a - 1) * b);
  while (choices.size < 4) {
    const candidate = correct + randInt(-3, 3);
    if (candidate > 0) choices.add(candidate);
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

export function generateMultiplicationQuestion(difficulty: number, _lang: Language = 'en'): Question {
  const maxTable = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 12;
  const a = randInt(1, maxTable);
  const b = randInt(1, maxTable);
  const correct = a * b;

  return {
    id: crypto.randomUUID(),
    topicId: 'multiplication',
    prompt: `${a} × ${b} = ?`,
    correctAnswer: correct,
    choices: makeMultChoices(a, b, correct),
    inputType: 'choice',
    difficulty,
  };
}

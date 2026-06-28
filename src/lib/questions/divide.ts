import type { Language } from '../i18n/types';
import type { Question } from '../types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeDivChoices(a: number, b: number, quotient: number): number[] {
  const choices = new Set<number>([quotient]);
  if (quotient > 1) choices.add(quotient - 1);
  choices.add(quotient + 1);
  const subGuess = a - b;
  if (subGuess > 0 && subGuess !== quotient) choices.add(subGuess);
  while (choices.size < 4) {
    const candidate = quotient + randInt(-2, 2);
    if (candidate > 0) choices.add(candidate);
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

export function generateDivisionQuestion(difficulty: number, _lang: Language = 'en'): Question {
  const maxTable = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 12;
  const b = randInt(2, maxTable);
  const quotient = randInt(1, maxTable);
  const a = b * quotient;

  return {
    id: crypto.randomUUID(),
    topicId: 'division',
    prompt: `${a} ÷ ${b} = ?`,
    correctAnswer: quotient,
    choices: makeDivChoices(a, b, quotient),
    inputType: 'choice',
    difficulty,
  };
}

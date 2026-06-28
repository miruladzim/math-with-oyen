import type { Language } from '../i18n/types';
import type { Question } from '../types';
import { getQuestionStrings } from '../i18n/translations';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const DENOMINATORS = [2, 3, 4, 6, 8];

export function generateFractionQuestion(difficulty: number, lang: Language = 'en'): Question {
  const qs = getQuestionStrings(lang);
  const maxDenomIndex = difficulty === 1 ? 1 : difficulty === 2 ? 3 : DENOMINATORS.length - 1;
  const denom = DENOMINATORS[randInt(0, maxDenomIndex)];
  const numer = randInt(1, denom - 1);
  const correct = `${numer}/${denom}`;

  const wrongOptions = new Set<string>();
  for (let wn = 1; wn <= denom; wn++) {
    const opt = `${wn}/${denom}`;
    if (opt !== correct) wrongOptions.add(opt);
  }
  for (const altDenom of DENOMINATORS) {
    if (wrongOptions.size >= 3) break;
    for (let n = 1; n < altDenom; n++) {
      const opt = `${n}/${altDenom}`;
      if (opt !== correct) wrongOptions.add(opt);
      if (wrongOptions.size >= 3) break;
    }
  }

  const choices = [correct, ...Array.from(wrongOptions).slice(0, 3)].sort(() => Math.random() - 0.5);

  return {
    id: crypto.randomUUID(),
    topicId: 'fractions',
    prompt: qs.fractionPrompt
      .replace('{numer}', String(numer))
      .replace('{denom}', String(denom)),
    correctAnswer: correct,
    choices,
    inputType: 'choice',
    difficulty,
    hint: qs.fractionHint
      .replace('{numer}', String(numer))
      .replace('{denom}', String(denom)),
  };
}

export function parseFraction(fraction: string): { numer: number; denom: number } {
  const [n, d] = fraction.split('/').map(Number);
  return { numer: n, denom: d };
}

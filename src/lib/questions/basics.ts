import type { Language } from '../i18n/types';
import type { Question } from '../types';
import { getQuestionStrings } from '../i18n/translations';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeChoices(correct: number, count: number, spread: number): number[] {
  const choices = new Set<number>([correct]);
  while (choices.size < count) {
    const offset = randInt(-spread, spread);
    const candidate = correct + offset;
    if (candidate >= 0 && candidate !== correct) {
      choices.add(candidate);
    }
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

function makeCompareChoices(correct: number, a: number, b: number): number[] {
  const choices = new Set<number>([correct, a, b]);
  while (choices.size < 4) {
    const candidate = correct + randInt(-3, 3);
    if (candidate >= 0) {
      choices.add(candidate);
    }
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

export function generateCompareQuestion(difficulty: number, lang: Language = 'en'): Question {
  const qs = getQuestionStrings(lang);
  const max = difficulty === 1 ? 10 : difficulty === 2 ? 30 : 50;
  let a = randInt(1, max);
  let b = randInt(1, max);
  while (a === b) {
    b = randInt(1, max);
  }

  const askBigger = Math.random() > 0.5;
  const correct = askBigger ? Math.max(a, b) : Math.min(a, b);
  const prompt = (askBigger ? qs.whichIsBigger : qs.whichIsSmaller)
    .replace('{a}', String(a))
    .replace('{b}', String(b));

  return {
    id: crypto.randomUUID(),
    topicId: 'compare',
    prompt,
    correctAnswer: correct,
    choices: makeCompareChoices(correct, a, b),
    inputType: 'choice',
    difficulty,
  };
}

export function generateNumberBondsQuestion(
  difficulty: number,
  lang: Language = 'en',
  bondTargetMax?: number,
): Question {
  const qs = getQuestionStrings(lang);
  let target: number;
  let part: number;

  if (difficulty === 1) {
    target = 10;
    part = randInt(1, 9);
  } else if (difficulty === 2 || bondTargetMax === 20) {
    target = 20;
    part = randInt(1, 19);
  } else {
    target = 100;
    part = randInt(1, 9) * 10;
  }

  const missing = target - part;
  const missingFirst = Math.random() > 0.5;
  const prompt = (missingFirst ? qs.numberBondMissingFirst : qs.numberBondMissing)
    .replace('{part}', String(part))
    .replace('{target}', String(target));

  return {
    id: crypto.randomUUID(),
    topicId: 'numberBonds',
    prompt,
    correctAnswer: missing,
    choices: makeChoices(missing, 4, difficulty === 3 ? 20 : 3),
    inputType: 'choice',
    difficulty,
    hint: qs.numberBondHint
      .replace('{part}', String(part))
      .replace('{target}', String(target)),
  };
}

export function generatePlaceValueQuestion(difficulty: number, lang: Language = 'en'): Question {
  const qs = getQuestionStrings(lang);

  if (difficulty === 1) {
    const n = randInt(11, 59);
    const tens = Math.floor(n / 10);
    return {
      id: crypto.randomUUID(),
      topicId: 'placeValue',
      prompt: qs.tensInNumber.replace('{n}', String(n)),
      correctAnswer: tens,
      choices: makeChoices(tens, 4, 2),
      inputType: 'choice',
      difficulty,
      hint: qs.placeValueTensHint,
    };
  }

  if (difficulty === 2) {
    const t = randInt(1, 9);
    const o = randInt(0, 9);
    const n = t * 10 + o;
    return {
      id: crypto.randomUUID(),
      topicId: 'placeValue',
      prompt: qs.tensAndOnes.replace('{t}', String(t)).replace('{o}', String(o)),
      correctAnswer: n,
      choices: makeChoices(n, 4, 11),
      inputType: 'choice',
      difficulty,
      hint: qs.placeValueComposeHint,
    };
  }

  const n = randInt(11, 99);
  const ones = n % 10;
  return {
    id: crypto.randomUUID(),
    topicId: 'placeValue',
    prompt: qs.onesInNumber.replace('{n}', String(n)),
    correctAnswer: ones,
    choices: makeChoices(ones, 4, 2),
    inputType: 'choice',
    difficulty,
    hint: qs.placeValueOnesHint,
  };
}

export function generatePatternsQuestion(difficulty: number, lang: Language = 'en'): Question {
  const qs = getQuestionStrings(lang);
  const step = difficulty === 1 ? 1 : 2;
  const startMax = difficulty === 1 ? 10 : 15;
  const start = randInt(1, startMax);
  const seq = [start, start + step, start + step * 2];
  const correct = start + step * 3;

  return {
    id: crypto.randomUUID(),
    topicId: 'patterns',
    prompt: `${qs.whatComesNext}\n${seq.join(', ')}, ?`,
    correctAnswer: correct,
    choices: makeChoices(correct, 4, step + 2),
    inputType: 'choice',
    difficulty,
  };
}

import type { Language } from '../i18n/types';
import { getQuestionStrings, interpolate, pickRandom, translations } from '../i18n/translations';
import type { GradeLevel, Question } from '../types';

export type ExamQuestionKind = 'skill' | 'story' | 'kbat';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeChoices(correct: number, count: number, spread: number): number[] {
  const choices = new Set<number>([correct]);
  let guard = 0;
  while (choices.size < count && guard < 50) {
    guard += 1;
    const candidate = correct + randInt(-spread, spread);
    if (candidate >= 0 && candidate !== correct) {
      choices.add(candidate);
    }
  }
  while (choices.size < count) {
    choices.add(correct + choices.size);
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

function makeStoryChoices(correct: number, wrongGuesses: number[]): number[] {
  const choices = new Set<number>([correct]);
  for (const guess of wrongGuesses) {
    if (guess >= 0 && guess !== correct) choices.add(guess);
  }
  let guard = 0;
  while (choices.size < 4 && guard < 30) {
    guard += 1;
    const candidate = correct + randInt(-3, 3);
    if (candidate >= 0 && candidate !== correct) choices.add(candidate);
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

function examStrings(lang: Language) {
  return translations[lang].questions.exam;
}

function pickItem(lang: Language, grade: GradeLevel): string {
  const qs = getQuestionStrings(lang);
  const keys =
    grade === 'k1'
      ? (['stickers', 'marbles', 'cookies', 'pencils'] as const)
      : (['stickers', 'marbles', 'books', 'cookies', 'pencils'] as const);
  return qs.items[pickRandom(keys)];
}

function pickName(lang: Language): string {
  return pickRandom(getQuestionStrings(lang).names);
}

function pickTwoNames(lang: Language): [string, string] {
  const names = getQuestionStrings(lang).names;
  const first = pickRandom(names);
  let second = pickRandom(names);
  while (second === first && names.length > 1) {
    second = pickRandom(names);
  }
  return [first, second];
}

function storyAddSub(grade: GradeLevel, difficulty: number, lang: Language): Question {
  const qs = getQuestionStrings(lang);
  const name = pickName(lang);
  const item = pickItem(lang, grade);
  const max =
    grade === 'k1'
      ? difficulty === 1
        ? 5
        : difficulty === 2
          ? 8
          : 10
      : difficulty === 1
        ? 12
        : difficulty === 2
          ? 25
          : 50;

  const isAdd = Math.random() > 0.45;
  let a = randInt(2, Math.max(3, Math.floor(max / 2)));
  let b = randInt(1, Math.max(2, Math.floor(max / 2)));

  if (isAdd) {
    while (a + b > max) {
      a = randInt(2, Math.max(3, Math.floor(max / 2)));
      b = randInt(1, Math.max(2, Math.floor(max / 2)));
    }
    const correct = a + b;
    return {
      id: crypto.randomUUID(),
      topicId: 'wordProblems',
      prompt: interpolate(qs.wordAdd, { name, a, b, item }),
      correctAnswer: correct,
      inputType: 'choice',
      choices: makeStoryChoices(correct, [a, b, a + b - 1, correct + 1]),
      difficulty,
    };
  }

  if (a < b) [a, b] = [b, a];
  const correct = a - b;
  return {
    id: crypto.randomUUID(),
    topicId: 'wordProblems',
    prompt: interpolate(qs.wordSub, { name, a, b, item }),
    correctAnswer: correct,
    inputType: 'choice',
    choices: makeStoryChoices(correct, [a, b, a + b, Math.max(0, correct - 1)]),
    difficulty,
  };
}

function storyTwoStep(grade: GradeLevel, difficulty: number, lang: Language): Question {
  const ex = examStrings(lang);
  const name = pickName(lang);
  const item = pickItem(lang, grade);
  const cap = grade === 'grade2' ? 15 : grade === 'grade3' ? 30 : 40;

  let a = randInt(3, Math.min(12, cap));
  let b = randInt(1, 6);
  let c = randInt(1, Math.min(5, a + b - 1));
  const correct = a + b - c;

  return {
    id: crypto.randomUUID(),
    topicId: 'wordProblems',
    prompt: interpolate(ex.storyTwoStep, { name, a, b, c, item }),
    correctAnswer: correct,
    inputType: 'choice',
    choices: makeStoryChoices(correct, [a + b, a - c, a + b + 1, correct + 1]),
    difficulty,
  };
}

function storyMultiply(difficulty: number, lang: Language, grade: GradeLevel): Question {
  const ex = examStrings(lang);
  const item = pickItem(lang, grade);
  const maxTable = difficulty === 1 ? 5 : difficulty === 2 ? 8 : 10;
  const perBag = randInt(2, maxTable);
  const bags = randInt(2, difficulty === 1 ? 4 : 5);
  const correct = perBag * bags;

  return {
    id: crypto.randomUUID(),
    topicId: 'wordProblems',
    prompt: interpolate(ex.storyMult, { n: perBag, bags, item }),
    correctAnswer: correct,
    inputType: 'choice',
    choices: makeStoryChoices(correct, [perBag + bags, perBag * (bags - 1), correct + perBag, correct - 1]),
    difficulty,
  };
}

function storyShare(difficulty: number, lang: Language, grade: GradeLevel): Question {
  const ex = examStrings(lang);
  const item = pickItem(lang, grade);
  const groups = randInt(2, difficulty === 1 ? 4 : 6);
  const quotient = randInt(2, difficulty === 1 ? 5 : 8);
  const total = groups * quotient;

  return {
    id: crypto.randomUUID(),
    topicId: 'wordProblems',
    prompt: interpolate(ex.storyShare, { total, groups, item }),
    correctAnswer: quotient,
    inputType: 'choice',
    choices: makeStoryChoices(quotient, [groups, total - groups, quotient + 1, quotient - 1]),
    difficulty,
  };
}

export function generateExamStoryQuestion(
  grade: GradeLevel,
  difficulty: 1 | 2 | 3,
  lang: Language = 'en',
): Question {
  if (grade === 'k1' || grade === 'grade2') {
    if (grade === 'grade2' && difficulty >= 3 && Math.random() > 0.4) {
      return storyTwoStep(grade, difficulty, lang);
    }
    return storyAddSub(grade, difficulty, lang);
  }

  if (grade === 'grade3') {
    return Math.random() > 0.5
      ? storyMultiply(difficulty, lang, grade)
      : storyShare(difficulty, lang, grade);
  }

  // grade45
  if (difficulty >= 2 && Math.random() > 0.45) {
    return storyTwoStep(grade, difficulty, lang);
  }
  return Math.random() > 0.5
    ? storyMultiply(difficulty, lang, grade)
    : storyShare(difficulty, lang, grade);
}

function kbatHowManyMore(grade: GradeLevel, difficulty: number, lang: Language): Question {
  const ex = examStrings(lang);
  const name = pickName(lang);
  const item = pickItem(lang, grade);
  const target =
    grade === 'k1'
      ? difficulty === 1
        ? randInt(5, 8)
        : difficulty === 2
          ? randInt(8, 10)
          : 10
      : difficulty === 1
        ? randInt(10, 15)
        : difficulty === 2
          ? randInt(15, 30)
          : randInt(30, 50);
  const has = randInt(Math.max(1, target - 8), target - 1);
  const correct = target - has;

  return {
    id: crypto.randomUUID(),
    topicId: 'numberBonds',
    prompt: interpolate(ex.kbatHowManyMore, { name, a: has, target, item }),
    correctAnswer: correct,
    inputType: 'choice',
    choices: makeChoices(correct, 4, Math.max(2, Math.ceil(correct / 2))),
    difficulty,
  };
}

function kbatDifference(grade: GradeLevel, difficulty: number, lang: Language): Question {
  const ex = examStrings(lang);
  const [name1, name2] = pickTwoNames(lang);
  const item = pickItem(lang, grade);
  const max = grade === 'k1' ? 10 : difficulty === 1 ? 20 : difficulty === 2 ? 40 : 60;
  let a = randInt(3, max);
  let b = randInt(1, max - 1);
  while (a <= b) {
    a = randInt(3, max);
    b = randInt(1, max - 1);
  }
  const correct = a - b;

  return {
    id: crypto.randomUUID(),
    topicId: 'compare',
    prompt: interpolate(ex.kbatDifference, { name1, name2, a, b, item }),
    correctAnswer: correct,
    inputType: 'choice',
    choices: makeChoices(correct, 4, Math.max(2, Math.ceil(correct / 2) + 1)),
    difficulty,
  };
}

function kbatPattern(difficulty: number, lang: Language): Question {
  const qs = getQuestionStrings(lang);
  const step = difficulty === 1 ? 1 : difficulty === 2 ? 2 : randInt(2, 5);
  const start = randInt(1, difficulty === 1 ? 8 : 12);
  const seq = [start, start + step, start + step * 2];
  const correct = start + step * 3;

  return {
    id: crypto.randomUUID(),
    topicId: 'patterns',
    prompt: `${qs.whatComesNext}\n${seq.join(', ')}, ?`,
    correctAnswer: correct,
    inputType: 'choice',
    choices: makeChoices(correct, 4, step + 2),
    difficulty,
  };
}

function kbatMissingFactor(difficulty: number, lang: Language): Question {
  const ex = examStrings(lang);
  const b = randInt(2, difficulty === 1 ? 5 : difficulty === 2 ? 8 : 10);
  const missing = randInt(2, difficulty === 1 ? 5 : difficulty === 2 ? 9 : 12);
  const product = b * missing;

  return {
    id: crypto.randomUUID(),
    topicId: 'multiplication',
    prompt: interpolate(ex.kbatMissingFactor, { b, product }),
    correctAnswer: missing,
    inputType: 'choice',
    choices: makeChoices(missing, 4, 3),
    difficulty,
  };
}

function kbatWhichFractionGreater(difficulty: number, lang: Language): Question {
  const ex = examStrings(lang);
  const pairs: [string, string, string][] = [
    ['1/2', '1/4', '1/2'],
    ['3/4', '1/2', '3/4'],
    ['2/3', '1/3', '2/3'],
    ['5/8', '3/8', '5/8'],
  ];
  const pool = difficulty === 1 ? pairs.slice(0, 2) : pairs;
  const [f1, f2, correct] = pickRandom(pool);
  const wrongPool = pairs.map((p) => p[0]).concat(pairs.map((p) => p[1]));
  const choices = new Set<string>([correct]);
  for (const opt of wrongPool) {
    if (choices.size >= 4) break;
    if (opt !== correct) choices.add(opt);
  }
  while (choices.size < 4) {
    choices.add(f1 === correct ? f2 : f1);
    if (choices.size < 4) choices.add('1/8');
  }

  return {
    id: crypto.randomUUID(),
    topicId: 'fractions',
    prompt: interpolate(ex.kbatWhichFractionGreater, { f1, f2 }),
    correctAnswer: correct,
    inputType: 'choice',
    choices: Array.from(choices).slice(0, 4).sort(() => Math.random() - 0.5),
    difficulty,
  };
}

function kbatPlaceValueReason(difficulty: number, lang: Language): Question {
  const qs = getQuestionStrings(lang);
  const tens = randInt(1, difficulty === 1 ? 5 : 9);
  const ones = randInt(0, 9);
  const n = tens * 10 + ones;
  const correct = tens;

  return {
    id: crypto.randomUUID(),
    topicId: 'placeValue',
    prompt: interpolate(qs.tensInNumber, { n }),
    correctAnswer: correct,
    inputType: 'choice',
    choices: makeChoices(correct, 4, 2),
    difficulty,
  };
}

export function generateExamKbatQuestion(
  grade: GradeLevel,
  difficulty: 1 | 2 | 3,
  lang: Language = 'en',
): Question {
  const roll = Math.random();

  if (grade === 'k1') {
    if (roll < 0.45) return kbatHowManyMore(grade, difficulty, lang);
    if (roll < 0.8) return kbatDifference(grade, difficulty, lang);
    return kbatPattern(difficulty, lang);
  }

  if (grade === 'grade2') {
    if (roll < 0.35) return kbatHowManyMore(grade, difficulty, lang);
    if (roll < 0.6) return kbatDifference(grade, difficulty, lang);
    if (roll < 0.8) return kbatPlaceValueReason(difficulty, lang);
    return kbatPattern(difficulty, lang);
  }

  if (grade === 'grade3') {
    if (roll < 0.3) return kbatMissingFactor(difficulty, lang);
    if (roll < 0.55) return kbatDifference(grade, difficulty, lang);
    if (roll < 0.75) return kbatHowManyMore(grade, difficulty, lang);
    return kbatPattern(difficulty, lang);
  }

  // grade45
  if (roll < 0.35) return kbatWhichFractionGreater(difficulty, lang);
  if (roll < 0.6) return kbatMissingFactor(difficulty, lang);
  if (roll < 0.8) return kbatDifference(grade, difficulty, lang);
  return kbatHowManyMore(grade, difficulty, lang);
}

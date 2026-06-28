import type { Language } from '../../i18n/types';
import type { GradeLevel, LabModeId } from '../../types';
import { translate, pickRandom, translations } from '../../i18n/translations';
import type {
  BalanceScaleChallenge,
  EquationBuilderChallenge,
  LabChallenge,
  NumberLineChallenge,
  PatternStudioChallenge,
  SortSquadChallenge,
  ThinkStepsChallenge,
} from './types';

function uid(): string {
  return crypto.randomUUID();
}

function pickMistake(lang: Language, mode: string, index: number): string {
  const keys = ['a', 'b', 'c'] as const;
  return translate(lang, `lab.modes.${mode}.mistakes.${keys[index % 3]}`);
}

function steps(lang: Language, mode: string): string[] {
  return [1, 2, 3].map((n) => translate(lang, `lab.modes.${mode}.steps.${n}`));
}

export function buildNumberLineChallenge(
  difficulty: number,
  lang: Language,
  round: number,
): NumberLineChallenge {
  const d = Math.min(3, Math.max(1, difficulty)) as 1 | 2 | 3;
  const max = d === 1 ? 10 : d === 2 ? 20 : 30;
  const start = Math.floor(Math.random() * (max - 4));
  const jump = d === 1 ? 1 + Math.floor(Math.random() * 4) : d === 2 ? 2 + Math.floor(Math.random() * 4) : 3 + Math.floor(Math.random() * 5);
  const target = Math.min(max, start + jump);
  return {
    id: uid(),
    modeId: 'numberLine',
    difficulty: d,
    start,
    target,
    min: 0,
    max,
    prompt: translate(lang, 'lab.modes.numberLine.prompt', { start, target }),
    explanation: translate(lang, 'lab.modes.numberLine.explanation', { start, target, jump: target - start }),
    strategyPrompt: translate(lang, 'lab.modes.numberLine.strategy'),
    mistakeHints: [0, 1, 2].map((i) => pickMistake(lang, 'numberLine', i + round)),
    steps: steps(lang, 'numberLine'),
  };
}

export function buildEquationBuilderChallenge(
  difficulty: number,
  lang: Language,
  round: number,
): EquationBuilderChallenge {
  const d = Math.min(3, Math.max(1, difficulty)) as 1 | 2 | 3;
  const max = d === 1 ? 10 : d === 2 ? 20 : 12;
  const leftB = 1 + Math.floor(Math.random() * (max - 1));
  const leftA = 1 + Math.floor(Math.random() * (max - leftB));
  const result = leftA + leftB;
  const wrong = new Set<number>();
  while (wrong.size < 3) {
    const w = 1 + Math.floor(Math.random() * max);
    if (w !== leftA) wrong.add(w);
  }
  const tiles = [leftA, ...Array.from(wrong)].sort(() => Math.random() - 0.5);
  return {
    id: uid(),
    modeId: 'equationBuilder',
    difficulty: d,
    leftA: null,
    leftB,
    result,
    missingSlot: 'leftA',
    tiles,
    correctTile: leftA,
    prompt: translate(lang, 'lab.modes.equationBuilder.prompt', { b: leftB, result }),
    explanation: translate(lang, 'lab.modes.equationBuilder.explanation', { a: leftA, b: leftB, result }),
    strategyPrompt: translate(lang, 'lab.modes.equationBuilder.strategy'),
    mistakeHints: [0, 1, 2].map((i) => pickMistake(lang, 'equationBuilder', i + round)),
    steps: steps(lang, 'equationBuilder'),
  };
}

export function buildBalanceScaleChallenge(
  difficulty: number,
  lang: Language,
  round: number,
): BalanceScaleChallenge {
  const d = Math.min(3, Math.max(1, difficulty)) as 1 | 2 | 3;
  const groups = d === 1 ? 2 : d === 2 ? 3 : 4;
  const perGroup = 2 + Math.floor(Math.random() * (d + 1));
  const targetLeft = groups * perGroup;
  const targetRight = targetLeft;
  const blockValues = d === 1 ? [1, 2, 5] : d === 2 ? [1, 2, 5, 10] : [2, 3, 5];
  return {
    id: uid(),
    modeId: 'balanceScale',
    difficulty: d,
    targetLeft,
    targetRight,
    blockValues,
    prompt: translate(lang, 'lab.modes.balanceScale.prompt', { target: targetLeft }),
    explanation: translate(lang, 'lab.modes.balanceScale.explanation', { target: targetLeft }),
    strategyPrompt: translate(lang, 'lab.modes.balanceScale.strategy'),
    mistakeHints: [0, 1, 2].map((i) => pickMistake(lang, 'balanceScale', i + round)),
    steps: steps(lang, 'balanceScale'),
  };
}

const SHAPES = ['🔴', '🔵', '🟡', '🟢', '🟣'];

export function buildPatternStudioChallenge(
  difficulty: number,
  lang: Language,
  round: number,
): PatternStudioChallenge {
  const d = Math.min(3, Math.max(1, difficulty)) as 1 | 2 | 3;
  const useShapes = round % 2 === 0;
  if (useShapes) {
    const pattern = SHAPES.slice(0, 2 + d);
    const seq = [...pattern, ...pattern].slice(0, 4 + d);
    const correctAnswer = pattern[seq.length % pattern.length];
    const gapIndex = seq.length;
    const fullSeq = [...seq, '?'];
    const wrong = new Set<string>();
    while (wrong.size < 3) {
      const w = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      if (w !== correctAnswer) wrong.add(w);
    }
    return {
      id: uid(),
      modeId: 'patternStudio',
      difficulty: d,
      sequence: fullSeq,
      correctAnswer,
      tileOptions: [correctAnswer, ...Array.from(wrong)].sort(() => Math.random() - 0.5),
      gapIndex,
      prompt: translate(lang, 'lab.modes.patternStudio.promptShape'),
      explanation: translate(lang, 'lab.modes.patternStudio.explanation', { answer: correctAnswer }),
      strategyPrompt: translate(lang, 'lab.modes.patternStudio.strategy'),
      mistakeHints: [0, 1, 2].map((i) => pickMistake(lang, 'patternStudio', i + round)),
      steps: steps(lang, 'patternStudio'),
    };
  }
  const step = d === 1 ? 1 : d === 2 ? 2 : 5;
  const start = step * (1 + Math.floor(Math.random() * 3));
  const seq = Array.from({ length: 4 + d }, (_, i) => String(start + i * step));
  const correctAnswer = String(start + seq.length * step);
  const gapIndex = seq.length;
  const wrong = new Set<string>();
  while (wrong.size < 3) {
    const w = String(start + Math.floor(Math.random() * 20));
    if (w !== correctAnswer) wrong.add(w);
  }
  return {
    id: uid(),
    modeId: 'patternStudio',
    difficulty: d,
    sequence: [...seq, '?'],
    correctAnswer,
    tileOptions: [correctAnswer, ...Array.from(wrong)].sort(() => Math.random() - 0.5),
    gapIndex,
    prompt: translate(lang, 'lab.modes.patternStudio.promptNumber', { step }),
    explanation: translate(lang, 'lab.modes.patternStudio.explanation', { answer: correctAnswer }),
    strategyPrompt: translate(lang, 'lab.modes.patternStudio.strategy'),
    mistakeHints: [0, 1, 2].map((i) => pickMistake(lang, 'patternStudio', i + round)),
    steps: steps(lang, 'patternStudio'),
  };
}

export function buildSortSquadChallenge(
  difficulty: number,
  lang: Language,
  round: number,
): SortSquadChallenge {
  const d = Math.min(3, Math.max(1, difficulty)) as 1 | 2 | 3;
  const threshold = d === 1 ? 25 : d === 2 ? 50 : 100;
  const nums = Array.from({ length: 4 + d }, () => 5 + Math.floor(Math.random() * (threshold + 20)));
  const cards = nums.map((n, i) => ({
    id: `c-${i}`,
    label: String(n),
    binId: n < threshold ? 'low' : 'high',
  }));
  return {
    id: uid(),
    modeId: 'sortSquad',
    difficulty: d,
    cards,
    bins: [
      { id: 'low', label: translate(lang, 'lab.modes.sortSquad.binLow', { n: threshold }) },
      { id: 'high', label: translate(lang, 'lab.modes.sortSquad.binHigh', { n: threshold }) },
    ],
    prompt: translate(lang, 'lab.modes.sortSquad.prompt', { n: threshold }),
    explanation: translate(lang, 'lab.modes.sortSquad.explanation', { n: threshold }),
    strategyPrompt: translate(lang, 'lab.modes.sortSquad.strategy'),
    mistakeHints: [0, 1, 2].map((i) => pickMistake(lang, 'sortSquad', i + round)),
    steps: steps(lang, 'sortSquad'),
  };
}

export function buildThinkStepsChallenge(
  difficulty: number,
  lang: Language,
  grade: GradeLevel,
  round: number,
): ThinkStepsChallenge {
  const d = Math.min(3, Math.max(1, difficulty)) as 1 | 2 | 3;
  let a = 3 + Math.floor(Math.random() * (d * 5));
  let b = 2 + Math.floor(Math.random() * (d * 4));
  const useMult = grade === 'grade3' || grade === 'grade45';
  const operation: 'add' | 'sub' | 'mult' = useMult && round % 2 === 1 ? 'mult' : round % 2 === 0 ? 'add' : 'sub';
  if (operation === 'sub' && a <= b) {
    a = b + 1 + Math.floor(Math.random() * Math.max(1, d * 3));
  }
  const correctAnswer = operation === 'add' ? a + b : operation === 'sub' ? a - b : a * b;
  const storyKey = operation === 'add' ? 'add' : operation === 'sub' ? 'sub' : 'mult';
  const name = pickRandom(translations[lang].questions.names);
  return {
    id: uid(),
    modeId: 'thinkSteps',
    difficulty: d,
    story: translate(lang, `lab.modes.thinkSteps.${storyKey}`, { name, a, b }),
    numbers: [a, b],
    operation,
    correctAnswer,
    prompt: translate(lang, 'lab.modes.thinkSteps.prompt'),
    explanation: translate(lang, 'lab.modes.thinkSteps.explanation', { answer: correctAnswer }),
    strategyPrompt: translate(lang, 'lab.modes.thinkSteps.strategy'),
    mistakeHints: [0, 1, 2].map((i) => pickMistake(lang, 'thinkSteps', i + round)),
    steps: steps(lang, 'thinkSteps'),
  };
}

export function buildLabChallenge(
  modeId: LabChallenge['modeId'],
  difficulty: number,
  lang: Language,
  grade: GradeLevel,
  round: number,
): LabChallenge {
  switch (modeId) {
    case 'numberLine':
      return buildNumberLineChallenge(difficulty, lang, round);
    case 'equationBuilder':
      return buildEquationBuilderChallenge(difficulty, lang, round);
    case 'balanceScale':
      return buildBalanceScaleChallenge(difficulty, lang, round);
    case 'patternStudio':
      return buildPatternStudioChallenge(difficulty, lang, round);
    case 'sortSquad':
      return buildSortSquadChallenge(difficulty, lang, round);
    case 'thinkSteps':
      return buildThinkStepsChallenge(difficulty, lang, grade, round);
  }
}

export function buildChallengeForMode(
  modeId: LabModeId,
  difficulty: number,
  lang: Language,
  grade: GradeLevel,
  round: number,
): LabChallenge {
  return buildLabChallenge(modeId, difficulty, lang, grade, round);
}

import type { Language } from '../../i18n/types';
import type { GradeLevel, LabModeId } from '../../types';
import { translate, pickRandom, translations, getQuestionStrings } from '../../i18n/translations';
import { COUNTING_EMOJI, pickRandomEmoji } from '../../kidFriendlyEmojis';
import { buildCompareVisual } from '../../questions/preschoolVisual';
import type {
  BalanceScaleChallenge,
  CompareCoveChallenge,
  EquationBuilderChallenge,
  LabChallenge,
  NumberLineChallenge,
  NumberTraceChallenge,
  PatternStudioChallenge,
  PuzzlePatchChallenge,
  ShapeMatchChallenge,
  SortSquadChallenge,
  StoryWalkBeat,
  StoryWalkChallenge,
  TapGardenChallenge,
  ThinkStepsChallenge,
} from './types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeCompareChoices(correct: number, a: number, b: number): number[] {
  const choices = new Set<number>([correct, a, b]);
  while (choices.size < 4) {
    const candidate = correct + randInt(-3, 3);
    if (candidate >= 0) choices.add(candidate);
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

function uid(): string {
  return crypto.randomUUID();
}

const SHAPE_BINS = [
  { id: 'circles', emoji: '🔵', key: 'circles' as const },
  { id: 'squares', emoji: '🟥', key: 'squares' as const },
  { id: 'triangles', emoji: '🔺', key: 'triangles' as const },
  { id: 'stars', emoji: '⭐', key: 'stars' as const },
];

const TRACE_DOTS: Record<number, { x: number; y: number }[]> = {
  1: [
    { x: 50, y: 15 },
    { x: 50, y: 50 },
    { x: 50, y: 85 },
  ],
  2: [
    { x: 20, y: 25 },
    { x: 80, y: 25 },
    { x: 80, y: 50 },
    { x: 20, y: 75 },
    { x: 80, y: 85 },
  ],
  3: [
    { x: 25, y: 20 },
    { x: 75, y: 20 },
    { x: 50, y: 50 },
    { x: 75, y: 80 },
    { x: 25, y: 80 },
  ],
  4: [
    { x: 30, y: 15 },
    { x: 30, y: 50 },
    { x: 70, y: 15 },
    { x: 70, y: 85 },
  ],
  5: [
    { x: 75, y: 20 },
    { x: 25, y: 20 },
    { x: 25, y: 45 },
    { x: 75, y: 55 },
    { x: 25, y: 80 },
  ],
};

const PUZZLE_TEMPLATES: { cells: string[][]; correct: string; wrong: string[] }[] = [
  { cells: [['🌸', '🌸'], ['🌸', '?']], correct: '🌸', wrong: ['🦋', '🍎'] },
  { cells: [['⭐', '🌻'], ['⭐', '?']], correct: '⭐', wrong: ['🎈', '🐰'] },
  { cells: [['🍎', '🍎'], ['?', '🍎']], correct: '🍎', wrong: ['🌸', '🐻'] },
  { cells: [['🦋', '🦋'], ['🦋', '?']], correct: '🦋', wrong: ['🌻', '⭐'] },
];

function pickMistake(lang: Language, mode: string, index: number): string {
  const keys = ['a', 'b', 'c'] as const;
  return translate(lang, `lab.modes.${mode}.mistakes.${keys[index % 3]}`);
}

function steps(lang: Language, mode: string): string[] {
  return [1, 2, 3].map((n) => translate(lang, `lab.modes.${mode}.steps.${n}`));
}

const GARDEN_EMOJI = ['🌸', '🦋', '🐞', '🌻', '🍄', '🐝', '🌷', '⭐'];

export function buildTapGardenChallenge(
  difficulty: number,
  lang: Language,
  round: number,
): TapGardenChallenge {
  const d = Math.min(3, Math.max(1, difficulty)) as 1 | 2 | 3;
  const max = d === 1 ? 4 : d === 2 ? 5 : 6;
  const correctCount = 2 + Math.floor(Math.random() * (max - 1));
  const items = Array.from({ length: correctCount }, () =>
    GARDEN_EMOJI[Math.floor(Math.random() * GARDEN_EMOJI.length)],
  );
  const choices = new Set<number>([correctCount]);
  while (choices.size < 4) {
    const w = 1 + Math.floor(Math.random() * max);
    if (w !== correctCount) choices.add(w);
  }
  return {
    id: uid(),
    modeId: 'tapGarden',
    difficulty: d,
    items,
    correctCount,
    choices: Array.from(choices).sort((a, b) => a - b),
    prompt: translate(lang, 'lab.modes.tapGarden.prompt'),
    explanation: translate(lang, 'lab.modes.tapGarden.explanation', { count: correctCount }),
    strategyPrompt: translate(lang, 'lab.modes.tapGarden.strategy'),
    mistakeHints: [0, 1, 2].map((i) => pickMistake(lang, 'tapGarden', i + round)),
    steps: steps(lang, 'tapGarden'),
  };
}

function makeCountChoices(correct: number, max: number): number[] {
  const choices = new Set<number>([correct]);
  const upper = Math.max(max, correct + 2);
  for (let candidate = 1; candidate <= upper && choices.size < 4; candidate++) {
    if (candidate !== correct) choices.add(candidate);
  }
  let offset = 1;
  while (choices.size < 4) {
    const w = Math.max(0, correct + offset);
    choices.add(w);
    offset = offset > 0 ? -offset : -offset + 1;
  }
  return Array.from(choices).sort((a, b) => a - b);
}

export function buildCompareCoveChallenge(
  difficulty: number,
  lang: Language,
  round: number,
): CompareCoveChallenge {
  const d = Math.min(3, Math.max(1, difficulty)) as 1 | 2 | 3;
  const max = d === 1 ? 4 : d === 2 ? 5 : 6;
  let a = randInt(1, max);
  let b = randInt(1, max);
  while (a === b) b = randInt(1, max);
  const askBigger = Math.random() > 0.5;
  const correctAnswer = askBigger ? Math.max(a, b) : Math.min(a, b);
  const visual = buildCompareVisual(a, b, askBigger);
  const qs = getQuestionStrings(lang);
  const prompt = askBigger ? qs.whichGroupMore : qs.whichGroupLess;
  return {
    id: uid(),
    modeId: 'compareCove',
    difficulty: d,
    emoji: visual.emoji ?? '⭐',
    groupA: a,
    groupB: b,
    askBigger,
    correctAnswer,
    choices: makeCompareChoices(correctAnswer, a, b),
    prompt,
    explanation: translate(lang, 'lab.modes.compareCove.explanation', {
      answer: correctAnswer,
      emoji: visual.emoji ?? '⭐',
    }),
    strategyPrompt: translate(lang, 'lab.modes.compareCove.strategy'),
    mistakeHints: [0, 1, 2].map((i) => pickMistake(lang, 'compareCove', i + round)),
    steps: steps(lang, 'compareCove'),
  };
}

export function buildShapeMatchChallenge(
  difficulty: number,
  lang: Language,
  round: number,
): ShapeMatchChallenge {
  const d = Math.min(3, Math.max(1, difficulty)) as 1 | 2 | 3;
  const qs = getQuestionStrings(lang);
  const shape = SHAPE_BINS[randInt(0, SHAPE_BINS.length - 1)];
  const bins = SHAPE_BINS.map((entry) => ({
    id: entry.id,
    label: qs.shapes[entry.key],
  }));
  return {
    id: uid(),
    modeId: 'shapeMatch',
    difficulty: d,
    shapeEmoji: shape.emoji,
    shapeKey: shape.key,
    bins,
    correctBinId: shape.id,
    prompt: translate(lang, 'lab.modes.shapeMatch.prompt'),
    explanation: translate(lang, 'lab.modes.shapeMatch.explanation', {
      shape: qs.shapes[shape.key],
    }),
    strategyPrompt: translate(lang, 'lab.modes.shapeMatch.strategy'),
    mistakeHints: [0, 1, 2].map((i) => pickMistake(lang, 'shapeMatch', i + round)),
    steps: steps(lang, 'shapeMatch'),
  };
}

export function buildStoryWalkChallenge(
  difficulty: number,
  lang: Language,
  round: number,
): StoryWalkChallenge {
  const d = Math.min(3, Math.max(1, difficulty)) as 1 | 2 | 3;
  const max = d === 1 ? 3 : d === 2 ? 4 : 5;
  const name = pickRandom(translations[lang].questions.names);
  const beatKeys = ['beat1', 'beat2', 'beat3', 'beat4', 'beat5'] as const;
  const beats: StoryWalkBeat[] = beatKeys.map((key, index) => {
    const count = 1 + randInt(0, Math.min(max - 1, index + 1));
    const emoji = pickRandomEmoji(COUNTING_EMOJI);
    return {
      text: translate(lang, `lab.modes.storyWalk.${key}`, { name, emoji }),
      items: Array.from({ length: count }, () => emoji),
      correctCount: count,
      choices: makeCountChoices(count, max),
    };
  });
  const total = beats.reduce((sum, beat) => sum + beat.correctCount, 0);
  return {
    id: uid(),
    modeId: 'storyWalk',
    difficulty: d,
    name,
    beats,
    prompt: translate(lang, 'lab.modes.storyWalk.prompt', { name }),
    explanation: translate(lang, 'lab.modes.storyWalk.explanation', { name, total }),
    strategyPrompt: translate(lang, 'lab.modes.storyWalk.strategy'),
    mistakeHints: [0, 1, 2].map((i) => pickMistake(lang, 'storyWalk', i + round)),
    steps: steps(lang, 'storyWalk'),
  };
}

export function buildNumberTraceChallenge(
  difficulty: number,
  lang: Language,
  round: number,
): NumberTraceChallenge {
  const d = Math.min(3, Math.max(1, difficulty)) as 1 | 2 | 3;
  const digit = d === 1 ? randInt(1, 3) : d === 2 ? randInt(2, 4) : randInt(3, 5);
  return {
    id: uid(),
    modeId: 'numberTrace',
    difficulty: d,
    digit,
    dots: TRACE_DOTS[digit],
    prompt: translate(lang, 'lab.modes.numberTrace.prompt', { digit }),
    explanation: translate(lang, 'lab.modes.numberTrace.explanation', { digit }),
    strategyPrompt: translate(lang, 'lab.modes.numberTrace.strategy'),
    mistakeHints: [0, 1, 2].map((i) => pickMistake(lang, 'numberTrace', i + round)),
    steps: steps(lang, 'numberTrace'),
  };
}

export function buildPuzzlePatchChallenge(
  difficulty: number,
  lang: Language,
  round: number,
): PuzzlePatchChallenge {
  const d = Math.min(3, Math.max(1, difficulty)) as 1 | 2 | 3;
  const template = PUZZLE_TEMPLATES[randInt(0, PUZZLE_TEMPLATES.length - 1)];
  let missingRow = 0;
  let missingCol = 0;
  for (let r = 0; r < template.cells.length; r++) {
    for (let c = 0; c < template.cells[r].length; c++) {
      if (template.cells[r][c] === '?') {
        missingRow = r;
        missingCol = c;
      }
    }
  }
  const pieceOptions = [template.correct, ...template.wrong].sort(() => Math.random() - 0.5);
  return {
    id: uid(),
    modeId: 'puzzlePatch',
    difficulty: d,
    grid: template.cells.map((row) => [...row]),
    missingRow,
    missingCol,
    pieceOptions,
    correctPiece: template.correct,
    prompt: translate(lang, 'lab.modes.puzzlePatch.prompt'),
    explanation: translate(lang, 'lab.modes.puzzlePatch.explanation', { piece: template.correct }),
    strategyPrompt: translate(lang, 'lab.modes.puzzlePatch.strategy'),
    mistakeHints: [0, 1, 2].map((i) => pickMistake(lang, 'puzzlePatch', i + round)),
    steps: steps(lang, 'puzzlePatch'),
  };
}

export function buildNumberLineChallenge(
  difficulty: number,
  lang: Language,
  round: number,
  preschool = false,
): NumberLineChallenge {
  const d = Math.min(3, Math.max(1, difficulty)) as 1 | 2 | 3;
  const max = preschool ? 5 : d === 1 ? 10 : d === 2 ? 20 : 30;
  const start = Math.floor(Math.random() * Math.max(1, max - 2));
  const jump = preschool ? 1 + Math.floor(Math.random() * 2) : d === 1 ? 1 + Math.floor(Math.random() * 4) : d === 2 ? 2 + Math.floor(Math.random() * 4) : 3 + Math.floor(Math.random() * 5);
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
  preschool = false,
): PatternStudioChallenge {
  const d = Math.min(3, Math.max(1, difficulty)) as 1 | 2 | 3;
  const useShapes = preschool || round % 2 === 0;
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
  preschool = false,
): SortSquadChallenge {
  const d = Math.min(3, Math.max(1, difficulty)) as 1 | 2 | 3;
  const threshold = preschool ? 3 : d === 1 ? 25 : d === 2 ? 50 : 100;
  const nums = preschool
    ? Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 5))
    : Array.from({ length: 4 + d }, () => 5 + Math.floor(Math.random() * (threshold + 20)));
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
    case 'tapGarden':
      return buildTapGardenChallenge(difficulty, lang, round);
    case 'compareCove':
      return buildCompareCoveChallenge(difficulty, lang, round);
    case 'shapeMatch':
      return buildShapeMatchChallenge(difficulty, lang, round);
    case 'storyWalk':
      return buildStoryWalkChallenge(difficulty, lang, round);
    case 'numberTrace':
      return buildNumberTraceChallenge(difficulty, lang, round);
    case 'puzzlePatch':
      return buildPuzzlePatchChallenge(difficulty, lang, round);
    case 'numberLine':
      return buildNumberLineChallenge(difficulty, lang, round, grade === 'preschool');
    case 'equationBuilder':
      return buildEquationBuilderChallenge(difficulty, lang, round);
    case 'balanceScale':
      return buildBalanceScaleChallenge(difficulty, lang, round);
    case 'patternStudio':
      return buildPatternStudioChallenge(difficulty, lang, round, grade === 'preschool');
    case 'sortSquad':
      return buildSortSquadChallenge(difficulty, lang, round, grade === 'preschool');
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

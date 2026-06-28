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

function emojiRepeat(emoji: string, count: number): string {
  return Array(count).fill(emoji).join(' ');
}

const SHAPE_KEYS = ['circles', 'squares', 'triangles', 'stars'] as const;
const SHAPE_EMOJI: Record<(typeof SHAPE_KEYS)[number], string> = {
  circles: '🔵',
  squares: '🟥',
  triangles: '🔺',
  stars: '⭐',
};

export function generateCountingQuestion(difficulty: number, lang: Language = 'en'): Question {
  const qs = getQuestionStrings(lang);
  const max = difficulty === 1 ? 10 : difficulty === 2 ? 15 : 20;
  const count = randInt(1, max);
  const emoji = ['⭐', '🍎', '🐶', '🌸', '🎈'][randInt(0, 4)];

  return {
    id: crypto.randomUUID(),
    topicId: 'counting',
    prompt: `${qs.howManySee}\n${emojiRepeat(emoji, count)}`,
    correctAnswer: count,
    choices: makeChoices(count, 4, 3),
    inputType: 'choice',
    difficulty,
  };
}

export function generateShapesQuestion(difficulty: number, lang: Language = 'en'): Question {
  const qs = getQuestionStrings(lang);
  const shapeKey = SHAPE_KEYS[randInt(0, SHAPE_KEYS.length - 1)];
  const shapeName = qs.shapes[shapeKey];
  const emoji = SHAPE_EMOJI[shapeKey];
  const max = difficulty === 1 ? 5 : difficulty === 2 ? 8 : 10;
  const count = randInt(1, max);
  const others = SHAPE_KEYS.filter((k) => k !== shapeKey);
  const distractorKey = others[randInt(0, others.length - 1)];
  const extra = randInt(1, 3);

  const display =
    emojiRepeat(emoji, count) + ' ' + emojiRepeat(SHAPE_EMOJI[distractorKey], extra);

  return {
    id: crypto.randomUUID(),
    topicId: 'shapes',
    prompt: `${qs.howManyShape.replace('{shape}', shapeName)}\n${display}`,
    correctAnswer: count,
    choices: makeChoices(count, 4, 2),
    inputType: 'choice',
    difficulty,
  };
}

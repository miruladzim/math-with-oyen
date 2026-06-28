import { translations, type TranslationTree } from './i18n/translations';
import { getOyenAskGameHint, getOyenAskPracticeHint } from './i18n/oyenAsk';
import type { Language } from './i18n/types';
import type { TopicId } from './types';

export type GameHintId = keyof TranslationTree['hints']['games'];

export { getOyenAskGameHint, getOyenAskPracticeHint };

const PRACTICE_TOPIC_KEYS: TopicId[] = [
  'counting',
  'shapes',
  'addSub10',
  'addSub100',
  'skipCounting',
  'wordProblems',
  'multiplication',
  'division',
  'multiDigit',
  'fractions',
  'compare',
  'numberBonds',
  'placeValue',
  'patterns',
];

export function getPracticePickHint(lang: Language): string {
  return translations[lang].hints.practice.pickTopic;
}

export function getPracticeTopicHint(lang: Language, topicId: TopicId): string {
  if (PRACTICE_TOPIC_KEYS.includes(topicId)) {
    return translations[lang].hints.practice[topicId];
  }
  return translations[lang].hints.practice.quizIntro;
}

export function getPracticeWrongHint(lang: Language, topicId: TopicId | null): string {
  const topicTip = topicId ? getPracticeTopicHint(lang, topicId) : translations[lang].hints.practice.quizIntro;
  return `${translations[lang].hints.practice.afterWrong} ${topicTip}`;
}

export function getArcadeHint(lang: Language): string {
  return translations[lang].hints.arcade;
}

export function getGameHowTo(lang: Language, game: GameHintId): string {
  return translations[lang].hints.games[game].howTo;
}

export function getGameTip(lang: Language, game: GameHintId, round: number): string {
  const tips = translations[lang].hints.games[game].tips;
  return tips[round % tips.length];
}

export function getGameWrongHelp(lang: Language, game: GameHintId): string {
  return translations[lang].hints.games[game].wrong;
}

export function pickEncouragement(lang: Language, seed: number): string {
  const list = translations[lang].hints.encourage;
  return list[seed % list.length];
}

export type LabHintId = keyof TranslationTree['hints']['lab'];

export function getLabHowTo(lang: Language, mode: LabHintId): string {
  return translations[lang].hints.lab[mode].howTo;
}

export function getLabTip(lang: Language, mode: LabHintId, round: number): string {
  const tips = translations[lang].hints.lab[mode].tips;
  return tips[round % tips.length];
}

export function getLabWrongHelp(lang: Language, mode: LabHintId): string {
  return translations[lang].hints.lab[mode].wrong;
}

export { getOyenAskLabLine as getOyenAskLabHint } from './i18n/oyenAskLab';

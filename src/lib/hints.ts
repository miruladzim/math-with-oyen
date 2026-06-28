import { translations, type TranslationTree } from './i18n/translations';
import { getOyenAskGameHint, getOyenAskPracticeHint } from './i18n/oyenAsk';
import type { Language } from './i18n/types';
import type { LabModeId, TopicId } from './types';

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

export function getExamIntroHint(lang: Language): string {
  return translations[lang].hints.exam.intro;
}

export function getExamQuizHint(lang: Language): string {
  return translations[lang].hints.exam.quiz;
}

export function getExamWrongHint(lang: Language, topicId: TopicId): string {
  return `${translations[lang].hints.exam.afterWrong} ${getPracticeTopicHint(lang, topicId)}`;
}

export function getExamCheckpointHint(
  lang: Language,
  sectionCorrect: number,
  sectionTotal: number,
): string {
  if (sectionTotal === 0) return translations[lang].hints.exam.checkpointDefault;
  const pct = sectionCorrect / sectionTotal;
  if (pct >= 0.8) return translations[lang].hints.exam.checkpointGreat;
  if (pct >= 0.6) return translations[lang].hints.exam.checkpointGood;
  return translations[lang].hints.exam.checkpointTry;
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

export function getLabHowTo(lang: Language, mode: LabModeId): string {
  return translations[lang].hints.lab[mode as LabHintId].howTo;
}

export function getLabTip(lang: Language, mode: LabModeId, round: number): string {
  const tips = translations[lang].hints.lab[mode as LabHintId].tips;
  return tips[round % tips.length];
}

export function getLabWrongHelp(lang: Language, mode: LabModeId): string {
  return translations[lang].hints.lab[mode as LabHintId].wrong;
}

export function getTeacherLockHint(lang: Language): string {
  return translations[lang].hints.teacher.lockIntro;
}

export function getTeacherDashboardHint(lang: Language): string {
  return translations[lang].hints.teacher.dashboardIntro;
}

export function getTeacherProgressHint(lang: Language): string {
  return translations[lang].hints.teacher.progressHelp;
}

export function getTeacherWorksheetHint(lang: Language): string {
  return translations[lang].hints.teacher.worksheetHelp;
}

export function getTeacherSettingsHint(lang: Language): string {
  return translations[lang].hints.teacher.settingsHelp;
}

export { getOyenAskLabLine as getOyenAskLabHint } from './i18n/oyenAskLab';

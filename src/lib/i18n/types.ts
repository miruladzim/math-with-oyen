export type Language = 'en' | 'ms';

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  ms: 'Bahasa Melayu',
};

export const LANGUAGE_SHORT: Record<Language, string> = {
  en: 'EN',
  ms: 'BM',
};

/** @deprecated Use LANGUAGE_SHORT in UI; kept for aria labels via LANGUAGE_LABELS */
export const LANGUAGE_FLAGS = LANGUAGE_SHORT;

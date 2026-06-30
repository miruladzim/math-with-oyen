import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { updateSettings } from '../lib/progress';
import { useProgress } from './ProgressContext';
import {
  getBadgeLabel,
  getGradeDesc,
  getGradeLabel,
  getQuestionStrings,
  getTopicLabel,
  translate,
  type TranslationTree,
} from '../lib/i18n/translations';
import type { Language } from '../lib/i18n/types';
import type { GradeLevel, TopicId } from '../lib/types';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  topicLabel: (id: TopicId) => string;
  gradeLabel: (grade: GradeLevel) => string;
  gradeDesc: (grade: GradeLevel) => string;
  badgeLabel: (id: string) => string;
  q: TranslationTree['questions'];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { progress, setProgress } = useProgress();
  const language: Language = progress.settings.language ?? 'en';

  useEffect(() => {
    document.documentElement.lang = language === 'ms' ? 'ms' : 'en';
    document.title =
      language === 'ms' ? 'Matematik dengan Oyen' : 'Math With Oyen';
  }, [language]);

  const setLanguage = useCallback(
    (lang: Language) => {
      setProgress(updateSettings(progress, { language: lang }));
    },
    [progress, setProgress],
  );

  const value = useMemo<LanguageContextValue>(() => {
    const t = (path: string, params?: Record<string, string | number>) =>
      translate(language, path, params);

    return {
      language,
      setLanguage,
      t,
      topicLabel: (id: TopicId) => getTopicLabel(language, id),
      gradeLabel: (grade: GradeLevel) => getGradeLabel(language, grade),
      gradeDesc: (grade: GradeLevel) => getGradeDesc(language, grade),
      badgeLabel: (id: string) =>
        getBadgeLabel(language, id as keyof TranslationTree['badges']),
      q: getQuestionStrings(language),
    };
  }, [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

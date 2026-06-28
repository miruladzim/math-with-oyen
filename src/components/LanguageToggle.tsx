import { useLanguage } from '../context/LanguageContext';
import { LANGUAGE_FLAGS, LANGUAGE_LABELS, type Language } from '../lib/i18n/types';
import styles from './LanguageToggle.module.css';

interface LanguageToggleProps {
  compact?: boolean;
  embedded?: boolean;
}

export function LanguageToggle({ compact = false, embedded = false }: LanguageToggleProps) {
  const { language, setLanguage, t } = useLanguage();

  const options: Language[] = ['en', 'ms'];

  if (compact) {
    return (
      <div
        className={`${styles.compactWrap} ${embedded ? styles.compactEmbedded : ''}`}
        role="group"
        aria-label={t('language.label')}
      >
        {options.map((lang) => (
          <button
            key={lang}
            type="button"
            className={`${styles.compactBtn} ${language === lang ? styles.compactBtnActive : ''}`}
            onClick={() => setLanguage(lang)}
            aria-pressed={language === lang}
            aria-label={t('language.switchTo', { lang: LANGUAGE_LABELS[lang] })}
            title={LANGUAGE_LABELS[lang]}
          >
            {LANGUAGE_FLAGS[lang]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.wrap} role="group" aria-label={t('language.label')}>
      <span className={styles.label}>{t('language.label')}</span>
      <div className={styles.toggle}>
        {options.map((lang) => (
          <button
            key={lang}
            type="button"
            className={`${styles.btn} ${language === lang ? styles.btnActive : ''}`}
            onClick={() => setLanguage(lang)}
            aria-pressed={language === lang}
            aria-label={t('language.switchTo', { lang: LANGUAGE_LABELS[lang] })}
          >
            <span className={styles.flag} aria-hidden="true">
              {LANGUAGE_FLAGS[lang]}
            </span>
            {LANGUAGE_LABELS[lang]}
          </button>
        ))}
      </div>
    </div>
  );
}

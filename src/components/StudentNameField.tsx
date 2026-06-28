import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { sanitizeStudentName } from '../lib/progress';
import styles from './StudentNameField.module.css';

interface StudentNameFieldProps {
  showGreeting?: boolean;
}

export function StudentNameField({ showGreeting = false }: StudentNameFieldProps) {
  const { studentName, setStudentName } = useProgress();
  const { t } = useLanguage();
  const [draft, setDraft] = useState(studentName);

  useEffect(() => {
    setDraft(studentName);
  }, [studentName]);

  const commit = () => {
    const next = sanitizeStudentName(draft);
    setDraft(next);
    if (next !== studentName) {
      setStudentName(next);
    }
  };

  return (
    <div className={styles.wrap}>
      {showGreeting && studentName && (
        <p className={styles.greeting}>{t('home.greeting', { name: studentName })}</p>
      )}
      <label className={styles.label} htmlFor="student-name">
        {t('home.nameLabel')}
        <input
          id="student-name"
          className={styles.input}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          placeholder={t('home.namePlaceholder')}
          maxLength={24}
          autoComplete="nickname"
        />
      </label>
    </div>
  );
}

import { useLanguage } from '../context/LanguageContext';
import styles from './TeacherSectionNav.module.css';

export type TeacherSectionId = 'teacher-progress' | 'teacher-worksheets' | 'teacher-settings';

interface TeacherSectionNavProps {
  onJump: (sectionId: TeacherSectionId) => void;
}

const SECTIONS: { id: TeacherSectionId; icon: string; labelKey: string }[] = [
  { id: 'teacher-progress', icon: '📊', labelKey: 'teacher.navProgress' },
  { id: 'teacher-worksheets', icon: '📝', labelKey: 'teacher.navWorksheets' },
  { id: 'teacher-settings', icon: '⚙️', labelKey: 'teacher.navSettings' },
];

export function TeacherSectionNav({ onJump }: TeacherSectionNavProps) {
  const { t } = useLanguage();

  return (
    <nav className={styles.nav} aria-label={t('teacher.quickNavLabel')}>
      <p className={styles.label}>{t('teacher.quickNavLabel')}</p>
      <div className={styles.list} role="list">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={styles.link}
            role="listitem"
            onClick={() => onJump(section.id)}
          >
            <span className={styles.icon} aria-hidden="true">
              {section.icon}
            </span>
            {t(section.labelKey)}
          </button>
        ))}
      </div>
    </nav>
  );
}

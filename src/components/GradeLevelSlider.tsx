import type { GradeLevel } from '../lib/types';
import { useLanguage } from '../context/LanguageContext';
import styles from './GradeLevelSlider.module.css';

const GRADES: { id: GradeLevel; emoji: string; tone: string }[] = [
  { id: 'preschool', emoji: '🧸', tone: styles.gradePreschool },
  { id: 'k1', emoji: '🌱', tone: styles.gradeK1 },
  { id: 'grade2', emoji: '🧭', tone: styles.grade2 },
  { id: 'grade3', emoji: '🔨', tone: styles.grade3 },
  { id: 'grade45', emoji: '🏆', tone: styles.grade45 },
];

const GRADE_COUNT = GRADES.length;

const gradeIndexFor = (id: GradeLevel) => GRADES.findIndex((grade) => grade.id === id);
const wrapGradeIndex = (index: number) => ((index % GRADE_COUNT) + GRADE_COUNT) % GRADE_COUNT;

interface GradeLevelSliderProps {
  value: GradeLevel;
  onChange: (grade: GradeLevel) => void;
}

export function GradeLevelSlider({ value, onChange }: GradeLevelSliderProps) {
  const { t, gradeLabel } = useLanguage();

  const activeIndex = gradeIndexFor(value);
  const current = GRADES[activeIndex >= 0 ? activeIndex : 0];

  const shift = (delta: number) => {
    const baseIndex = activeIndex >= 0 ? activeIndex : 0;
    onChange(GRADES[wrapGradeIndex(baseIndex + delta)].id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      shift(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      shift(1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      onChange(GRADES[0].id);
    } else if (event.key === 'End') {
      event.preventDefault();
      onChange(GRADES[GRADE_COUNT - 1].id);
    }
  };

  return (
    <div
      className={styles.picker}
      role="group"
      aria-label={t('home.gradeLevelAria')}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={styles.stepBtn}
        onClick={() => shift(-1)}
        aria-label={t('home.prevLevel')}
      >
        <span aria-hidden="true">−</span>
      </button>

      <div className={`${styles.display} ${current.tone}`} aria-live="polite">
        <span className={styles.emoji} aria-hidden="true">
          {current.emoji}
        </span>
        <span className={styles.label}>{gradeLabel(current.id)}</span>
      </div>

      <button
        type="button"
        className={styles.stepBtn}
        onClick={() => shift(1)}
        aria-label={t('home.nextLevel')}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}

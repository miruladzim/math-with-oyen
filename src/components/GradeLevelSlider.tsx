import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
const LOOP_SLIDES = [...GRADES, ...GRADES, ...GRADES];

const gradeIndexFor = (id: GradeLevel) => GRADES.findIndex((grade) => grade.id === id);
const middleIndex = (gradeIndex: number) => GRADE_COUNT + gradeIndex;
const wrapGradeIndex = (index: number) => ((index % GRADE_COUNT) + GRADE_COUNT) % GRADE_COUNT;

interface GradeLevelSliderProps {
  value: GradeLevel;
  onChange: (grade: GradeLevel) => void;
}

export function GradeLevelSlider({ value, onChange }: GradeLevelSliderProps) {
  const { t, gradeLabel, gradeDesc } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const syncingRef = useRef(false);
  const valueRef = useRef(value);

  const activeIndex = gradeIndexFor(value);
  const [centeredIndex, setCenteredIndex] = useState(() =>
    middleIndex(activeIndex >= 0 ? activeIndex : 0),
  );

  valueRef.current = value;

  const centeredIndexRef = useRef(centeredIndex);
  const centeredIndexRefUpdate = (index: number) => {
    centeredIndexRef.current = index;
    setCenteredIndex(index);
  };

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const track = trackRef.current;
    const slide = slideRefs.current[index];
    if (!track || !slide) return;

    const targetLeft = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
    const maxLeft = track.scrollWidth - track.clientWidth;
    track.scrollTo({
      left: Math.max(0, Math.min(targetLeft, maxLeft)),
      behavior,
    });
  }, []);

  const applySelection = useCallback(
    (gradeIndex: number, slideIndex: number, behavior: ScrollBehavior = 'smooth') => {
      const grade = GRADES[gradeIndex];
      if (grade.id !== valueRef.current) {
        onChange(grade.id);
      }
      centeredIndexRefUpdate(slideIndex);
      scrollToIndex(slideIndex, behavior);
    },
    [onChange, scrollToIndex],
  );

  const findClosestIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return centeredIndexRef.current;

    const center = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(center - slideCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }, []);

  const normalizeLoop = useCallback(() => {
    const closestIndex = findClosestIndex();
    centeredIndexRefUpdate(closestIndex);

    const gradeIndex = wrapGradeIndex(closestIndex);
    const grade = GRADES[gradeIndex];
    if (grade.id !== valueRef.current) {
      onChange(grade.id);
    }

    if (closestIndex >= GRADE_COUNT && closestIndex < GRADE_COUNT * 2) {
      return;
    }

    const target = middleIndex(gradeIndex);
    syncingRef.current = true;
    scrollToIndex(target, 'auto');
    centeredIndexRefUpdate(target);
    window.setTimeout(() => {
      syncingRef.current = false;
    }, 50);
  }, [findClosestIndex, onChange, scrollToIndex]);

  const settleScroll = useCallback(() => {
    if (syncingRef.current) return;
    normalizeLoop();
  }, [normalizeLoop]);

  useLayoutEffect(() => {
    const gradeIndex = gradeIndexFor(valueRef.current);
    const target = middleIndex(gradeIndex >= 0 ? gradeIndex : 0);
    syncingRef.current = true;
    scrollToIndex(target, 'auto');
    centeredIndexRefUpdate(target);
    window.requestAnimationFrame(() => {
      syncingRef.current = false;
    });
  }, [scrollToIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    let settleTimer = 0;
    const handleScroll = () => {
      if (syncingRef.current) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        centeredIndexRefUpdate(findClosestIndex());
      });
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settleScroll, 140);
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    track.addEventListener('scrollend', settleScroll);
    return () => {
      track.removeEventListener('scroll', handleScroll);
      track.removeEventListener('scrollend', settleScroll);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
    };
  }, [findClosestIndex, settleScroll]);

  const shift = (delta: number) => {
    const currentGradeIndex =
      activeIndex >= 0 ? activeIndex : wrapGradeIndex(centeredIndexRef.current);
    const nextGradeIndex = wrapGradeIndex(currentGradeIndex + delta);
    applySelection(nextGradeIndex, middleIndex(nextGradeIndex), 'smooth');
  };

  const selectGrade = (id: GradeLevel, slideIndex?: number) => {
    const gradeIndex = gradeIndexFor(id);
    if (gradeIndex < 0) return;
    const targetIndex = slideIndex ?? middleIndex(gradeIndex);
    applySelection(gradeIndex, targetIndex, 'smooth');
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
      selectGrade(GRADES[0].id);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectGrade(GRADES[GRADE_COUNT - 1].id);
    }
  };

  return (
    <div className={styles.slider}>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => shift(-1)}
          aria-label={t('home.prevLevel')}
        >
          ‹
        </button>

        <div className={styles.trackWrap}>
          <div
            ref={trackRef}
            className={styles.track}
            data-touch-scroll="x"
            role="radiogroup"
            aria-label={t('home.gradeLevelAria')}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            {LOOP_SLIDES.map(({ id, emoji, tone }, index) => {
              const isCentered = centeredIndex === index;
              const isSelected = value === id;
              return (
                <button
                  key={`${id}-${index}`}
                  ref={(node) => {
                    slideRefs.current[index] = node;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  data-grade={id}
                  data-loop-index={index}
                  className={`${styles.slide} ${tone} ${isCentered ? styles.slideActive : ''}`}
                  onClick={() => selectGrade(id, index)}
                >
                  <span className={styles.emojiWrap} aria-hidden="true">
                    <span className={styles.emoji}>{emoji}</span>
                  </span>
                  <span className={styles.copy}>
                    <span className={styles.label}>{gradeLabel(id)}</span>
                    {isCentered ? <span className={styles.desc}>{gradeDesc(id)}</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className={styles.navBtn}
          onClick={() => shift(1)}
          aria-label={t('home.nextLevel')}
        >
          ›
        </button>
      </div>

      <div className={styles.footer}>
        <div className={styles.dots} role="tablist" aria-label={t('home.gradeLevelAria')}>
          {GRADES.map(({ id }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={value === id}
              aria-label={gradeLabel(id)}
              className={`${styles.dot} ${value === id ? styles.dotActive : ''}`}
              onClick={() => selectGrade(id)}
            >
              <span className={styles.dotMark} aria-hidden="true" />
            </button>
          ))}
        </div>
        <p className={styles.hint}>{t('home.slideLevelHint')}</p>
      </div>
    </div>
  );
}

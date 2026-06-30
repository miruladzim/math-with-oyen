import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { GradeLevelSlider } from '../components/GradeLevelSlider';
import { KidHint } from '../components/KidHint';
import { OyenAvatar } from '../components/OyenAvatar';
import { StudentNameField } from '../components/StudentNameField';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { GRADE_GAME_PICK } from '../lib/gameConfig';
import { getAllTopics, getTopicsForGrade } from '../lib/questions';
import { getNextPracticeSteps, getTopicProgress } from '../lib/progress';
import { getFinalExamProgress } from '../lib/exam/examProgress';
import { getMathTips } from '../lib/mathTips';
import { pickRandom, translations } from '../lib/i18n/translations';
import { isPreschool } from '../lib/preschoolConfig';
import type { GradeLevel } from '../lib/types';
import styles from './Home.module.css';

const GAME_EMOJI: Record<string, string> = {
  balloon: '🎈',
  dive: '🏊',
  rocket: '🚀',
  crystal: '💎',
  match: '🃏',
  pizza: '🍕',
};

export function Home() {
  const { gradeLevel, setGradeLevel, progress } = useProgress();
  const { t, language, topicLabel } = useLanguage();
  const [showLevelHint, setShowLevelHint] = useState(true);

  const dailyTip = useMemo(() => pickRandom(getMathTips(language)), [language]);
  const parentGuideSections = translations[language].home.parentGuideSections;

  const topics = getAllTopics(language);
  const gradeTopics = getTopicsForGrade(gradeLevel, language);
  const nextSteps = getNextPracticeSteps(progress, 3);
  const primaryStep = nextSteps[0];
  const recommendedTopic = topics.find((topic) => topic.id === primaryStep?.topicId);
  const recommendedGameId = GRADE_GAME_PICK[gradeLevel] ?? 'balloon';

  const totalStars = topics.reduce(
    (sum, topic) => sum + (getTopicProgress(progress, topic.id).stars ?? 0),
    0,
  );
  const gradeStars = gradeTopics.reduce(
    (sum, topic) => sum + (getTopicProgress(progress, topic.id).stars ?? 0),
    0,
  );

  const selectGrade = (id: GradeLevel) => {
    setGradeLevel(id);
    setShowLevelHint(false);
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <OyenAvatar size="lg" className={styles.heroIcon} />
        <div className={styles.heroBody}>
          <h1 className={styles.heroTitle}>{t('appName')}</h1>
          <p className={styles.heroTagline}>{t('appTagline')}</p>
          <StudentNameField showGreeting />
        </div>
      </header>

      {showLevelHint ? (
        <KidHint
          variant="howTo"
          message={
            isPreschool(gradeLevel)
              ? t('home.chooseLevelHintPreschool')
              : t('home.chooseLevelHint')
          }
        />
      ) : null}

      <section className={styles.levelSection} aria-labelledby="grade-heading">
        <h2 id="grade-heading" className={styles.sectionLabel}>
          {t('home.chooseLevel')}
        </h2>
        <GradeLevelSlider value={gradeLevel} onChange={selectGrade} />
      </section>

      <section className={styles.menuSection} aria-label={t('nav.home')}>
      <div className={styles.tileGrid}>
        <Link
          to="/practice"
          className={`${styles.tile} ${styles.tileLarge} ${styles.practiceTile}`}
        >
          <div className={`${styles.tileDecor} ${styles.practiceDecor}`} aria-hidden="true">
            <span>➕</span>
            <span>7</span>
            <span>✏️</span>
            <span>⭐</span>
            <span>🔢</span>
          </div>
          <span className={styles.tileIcon} aria-hidden="true">
            📝
          </span>
          <div className={styles.tileContent}>
            <h2 className={styles.tileTitle}>{t('home.practiceTitle')}</h2>
            <p className={styles.tileDesc}>
              {isPreschool(gradeLevel) ? t('home.practiceDescPreschool') : t('home.practiceDesc')}
            </p>
            {recommendedTopic ? (
              <p className={styles.tileMeta}>
                {t('home.recommendedTopic')}: {recommendedTopic.emoji}{' '}
                {topicLabel(recommendedTopic.id)}
              </p>
            ) : null}
          </div>
        </Link>

        <Link
          to="/games"
          className={`${styles.tile} ${styles.tileWide} ${styles.gamesTile}`}
        >
          <div className={`${styles.tileDecor} ${styles.gamesDecor}`} aria-hidden="true">
            <span>🕹️</span>
            <span>🎈</span>
          </div>
          <span className={styles.tileIcon} aria-hidden="true">
            🎮
          </span>
          <div className={styles.tileContent}>
            <h2 className={styles.tileTitle}>{t('home.gamesTitle')}</h2>
            <p className={styles.tileDesc}>
              {isPreschool(gradeLevel) ? t('home.gamesDescPreschool') : t('home.gamesDesc')}
            </p>
            <p className={styles.tileMeta}>
              {t('home.recommendedGame')}: {GAME_EMOJI[recommendedGameId]}
            </p>
          </div>
        </Link>

        <Link
          to="/lab"
          className={`${styles.tile} ${styles.tileWide} ${styles.labTile}`}
        >
          <div className={`${styles.tileDecor} ${styles.labDecor}`} aria-hidden="true">
            <span>🧪</span>
            <span>🧩</span>
            <span>⚖️</span>
            <span>🔢</span>
          </div>
          <span className={styles.tileIcon} aria-hidden="true">
            🔬
          </span>
          <div className={styles.tileContent}>
            <h2 className={styles.tileTitle}>{t('lab.homeTitle')}</h2>
            <p className={styles.tileDesc}>
              {isPreschool(gradeLevel) ? t('home.labDescPreschool') : t('lab.homeDesc')}
            </p>
          </div>
        </Link>

        {gradeLevel !== 'preschool' ? (
        <Link
          to="/exam"
          className={`${styles.tile} ${styles.tileWide} ${styles.examTile}`}
        >
          <div className={`${styles.tileDecor} ${styles.examDecor}`} aria-hidden="true">
            <span>🎓</span>
            <span>✓</span>
          </div>
          <span className={styles.tileIcon} aria-hidden="true">
            📋
          </span>
          <div className={styles.tileContent}>
            <h2 className={styles.tileTitle}>{t('home.examTitle')}</h2>
            <p className={styles.tileDesc}>{t('home.examDesc')}</p>
          </div>
        </Link>
        ) : null}

        <Link to="/progress" className={`${styles.tile} ${styles.starsTile}`}>
          <span className={styles.tileIcon} aria-hidden="true">
            ⭐
          </span>
          <div className={styles.tileContent}>
            <h2 className={styles.tileTitle}>{t('progress.title')}</h2>
            {totalStars > 0 && <p className={styles.tileMeta}>{totalStars} ⭐</p>}
          </div>
        </Link>

        <Link to="/teacher" className={`${styles.tile} ${styles.teacherTile}`}>
          <span className={styles.tileIcon} aria-hidden="true">
            👩‍🏫
          </span>
          <div className={styles.tileContent}>
            <h2 className={styles.tileTitle}>{t('nav.teacher')}</h2>
          </div>
        </Link>
      </div>
      </section>

      <section className={styles.mathTip} aria-labelledby="math-tip-heading">
        <h2 id="math-tip-heading" className={styles.mathTipTitle}>
          {t('home.tipTitle')}
        </h2>
        <p className={styles.mathTipBody}>{dailyTip}</p>
      </section>

      {gradeLevel !== 'preschool' &&
      gradeStars >= 10 &&
      !getFinalExamProgress(progress, gradeLevel)?.passed ? (
        <section className={styles.examNudge}>
          <Link to="/exam" className={styles.examNudgeLink}>
            {t('home.examReady')} 🎓
          </Link>
        </section>
      ) : null}

      <details className={styles.parentGuide}>
        <summary>{t('home.parentGuide')}</summary>
        <div className={styles.parentGuideBody}>
          {parentGuideSections.map((section) => (
            <section key={section.title} className={styles.parentGuideSection}>
              <h3 className={styles.parentGuideSectionTitle}>{section.title}</h3>
              <ul className={styles.parentGuideList}>
                {section.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </details>
    </div>
  );
}

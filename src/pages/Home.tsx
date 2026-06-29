import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
  const { gradeLevel, setGradeLevel, progress, patchSettings } = useProgress();
  const { t, language, topicLabel } = useLanguage();
  const navigate = useNavigate();
  const [showLevelHint, setShowLevelHint] = useState(true);

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

  const startRecommendedPractice = () => {
    if (!primaryStep) return;
    patchSettings({ onboardingDone: true });
    navigate(`/practice?topic=${primaryStep.topicId}`);
  };

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
          to={`/games?play=${recommendedGameId}`}
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

      {!progress.settings.onboardingDone && recommendedTopic ? (
        <section className={styles.startHere} aria-labelledby="start-here-heading">
          <h2 id="start-here-heading" className={styles.startHereTitle}>
            {t('home.startHere')}
          </h2>
          <p className={styles.startHereDesc}>{t('home.startHereDesc')}</p>
          <div className={styles.startHereActions}>
            <button type="button" className={styles.startHereBtn} onClick={startRecommendedPractice}>
              <span aria-hidden="true">{recommendedTopic.emoji}</span>
              {t('home.startPractice')} — {topicLabel(recommendedTopic.id)}
            </button>
            <Link
              to={`/games?play=${recommendedGameId}`}
              className={styles.startHereLink}
              onClick={() => patchSettings({ onboardingDone: true })}
            >
              {t('home.tryGame')} {GAME_EMOJI[recommendedGameId]}
            </Link>
          </div>
        </section>
      ) : null}

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
        <p>{t('home.parentGuideText')}</p>
      </details>
    </div>
  );
}

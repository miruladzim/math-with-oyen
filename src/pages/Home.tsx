import { Link, useNavigate } from 'react-router-dom';
import { StudentNameField } from '../components/StudentNameField';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { GRADE_GAME_PICK } from '../lib/gameConfig';
import { getAllTopics } from '../lib/questions';
import { getNextPracticeSteps, getTopicProgress } from '../lib/progress';
import type { GradeLevel } from '../lib/types';
import styles from './Home.module.css';

const GRADES: { id: GradeLevel; emoji: string; tone: string }[] = [
  { id: 'k1', emoji: '🌱', tone: styles.gradeK1 },
  { id: 'grade2', emoji: '🧭', tone: styles.grade2 },
  { id: 'grade3', emoji: '🔨', tone: styles.grade3 },
  { id: 'grade45', emoji: '🏆', tone: styles.grade45 },
];

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
  const { t, gradeLabel, language, topicLabel } = useLanguage();
  const navigate = useNavigate();

  const topics = getAllTopics(language);
  const nextSteps = getNextPracticeSteps(progress, 3);
  const primaryStep = nextSteps[0];
  const recommendedTopic = topics.find((topic) => topic.id === primaryStep?.topicId);
  const recommendedGameId = GRADE_GAME_PICK[gradeLevel] ?? 'balloon';

  const totalStars = topics.reduce(
    (sum, topic) => sum + (getTopicProgress(progress, topic.id).stars ?? 0),
    0,
  );

  const startRecommendedPractice = () => {
    if (!primaryStep) return;
    patchSettings({ onboardingDone: true });
    navigate(`/practice?topic=${primaryStep.topicId}`);
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">
          🐱
        </span>
        <div className={styles.heroBody}>
          <h1 className={styles.heroTitle}>{t('appName')}</h1>
          <p className={styles.heroTagline}>{t('appTagline')}</p>
          <StudentNameField showGreeting />
        </div>
      </header>

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

      {nextSteps.length > 0 ? (
        <section className={styles.nextSteps} aria-labelledby="next-steps-heading">
          <h2 id="next-steps-heading" className={styles.nextStepsTitle}>
            {t('home.nextSteps')}
          </h2>
          <ul className={styles.nextStepsList}>
            {nextSteps.map((step) => {
              const topic = topics.find((item) => item.id === step.topicId);
              if (!topic) return null;
              return (
                <li key={step.topicId}>
                  <Link to={`/practice?topic=${step.topicId}`} className={styles.nextStepLink}>
                    {t('home.nextStepItem', {
                      emoji: topic.emoji,
                      topic: topicLabel(step.topicId),
                    })}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className={styles.tileGrid}>
        <Link
          to="/practice"
          className={`${styles.tile} ${styles.tileLarge} ${styles.practiceTile}`}
        >
          <div className={`${styles.tileDecor} ${styles.practiceDecor}`} aria-hidden="true">
            <span>➕</span>
            <span>7</span>
            <span>✏️</span>
          </div>
          <span className={styles.tileIcon} aria-hidden="true">
            📝
          </span>
          <div className={styles.tileContent}>
            <h2 className={styles.tileTitle}>{t('home.practiceTitle')}</h2>
            <p className={styles.tileDesc}>{t('home.practiceDesc')}</p>
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
            <p className={styles.tileDesc}>{t('home.gamesDesc')}</p>
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
          </div>
          <span className={styles.tileIcon} aria-hidden="true">
            🔬
          </span>
          <div className={styles.tileContent}>
            <h2 className={styles.tileTitle}>{t('lab.homeTitle')}</h2>
            <p className={styles.tileDesc}>{t('lab.homeDesc')}</p>
          </div>
        </Link>

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

      <details className={styles.parentGuide}>
        <summary>{t('home.parentGuide')}</summary>
        <p>{t('home.parentGuideText')}</p>
      </details>

      <section className={styles.levelSection} aria-labelledby="grade-heading">
        <h2 id="grade-heading" className={styles.sectionLabel}>
          {t('home.chooseLevel')}
        </h2>
        <div className={styles.gradeGrid} role="radiogroup" aria-label={t('home.gradeLevelAria')}>
          {GRADES.map(({ id, emoji, tone }) => {
            const active = gradeLevel === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                className={`${styles.gradeBtn} ${tone} ${active ? styles.gradeBtnActive : ''}`}
                onClick={() => setGradeLevel(id)}
              >
                <span className={styles.gradeEmoji} aria-hidden="true">
                  {emoji}
                </span>
                <span className={styles.gradeLabel}>{gradeLabel(id)}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { getPracticePath } from '../lib/curriculum/practicePath';
import { getAllTopics, getTopicsForGrade } from '../lib/questions';
import { getLabModesForGrade } from '../lib/lab/labConfig';
import { getTopicProgress, getLabModeProgress } from '../lib/progress';
import { BADGE_DEFINITIONS } from '../lib/types';
import styles from './Progress.module.css';
import { StarDisplay } from '../components/StarDisplay';

export function ProgressPage() {
  const { progress } = useProgress();
  const { t, language, badgeLabel, topicLabel } = useLanguage();
  const gradeTopics = getTopicsForGrade(progress.gradeLevel, language);
  const allTopics = getAllTopics(language);
  const pathUnits = getPracticePath(progress.gradeLevel);
  const labModes = getLabModesForGrade(progress.gradeLevel);

  const gradeTopicIds = new Set(gradeTopics.map((topic) => topic.id));
  const otherTopics = allTopics.filter((topic) => !gradeTopicIds.has(topic.id));

  const totalStars = allTopics.reduce(
    (sum, topic) => sum + (getTopicProgress(progress, topic.id).stars ?? 0),
    0,
  );
  const totalAnswered = Object.values(progress.topics).reduce(
    (sum, tp) => sum + (tp?.totalAnswered ?? 0),
    0,
  );

  const renderTopicRow = (topicId: typeof gradeTopics[0]['id'], step?: number) => {
    const topic = allTopics.find((item) => item.id === topicId);
    if (!topic) return null;
    const tp = getTopicProgress(progress, topicId);
    const mastery = tp.masteryLevel ?? 0;

    return (
      <div key={topicId} className={styles.topicRow}>
        <span className={styles.topicName}>
          {step !== undefined ? (
            <span className={styles.pathStep}>{step}</span>
          ) : null}
          <span aria-hidden="true">{topic.emoji}</span>
          {topicLabel(topicId)}
        </span>
        <div className={styles.topicMeta}>
          {mastery > 0 ? (
            <span className={styles.masteryPill}>
              {t('progress.masteryLevel', { level: mastery })}
            </span>
          ) : null}
          <StarDisplay count={tp.stars as 0 | 1 | 2 | 3} />
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('progress.title')}</h1>
        <p className={styles.subtitle}>
          {progress.studentName
            ? t('progress.subtitleNamed', { name: progress.studentName })
            : t('progress.subtitle')}
        </p>
      </div>

      <section className={styles.weeklyCard} aria-labelledby="weekly-heading">
        <h2 id="weekly-heading" className={styles.sectionTitle}>
          {t('progress.weeklyTitle')}
        </h2>
        <p className={styles.weeklyStat}>
          {t('progress.weeklyStat', {
            correct: progress.weeklyCorrect,
            total: progress.weeklyAnswered,
          })}
        </p>
        {progress.badges.length < 3 ? (
          <p className={styles.weeklyNudge}>{t('progress.nextBadge')}</p>
        ) : (
          <p className={styles.weeklyNudge}>{t('progress.bestTopic')}</p>
        )}
      </section>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalStars}</div>
          <div className={styles.statLabel}>{t('progress.totalStars')}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalAnswered}</div>
          <div className={styles.statLabel}>{t('progress.questionsAnswered')}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{progress.streak}</div>
          <div className={styles.statLabel}>{t('progress.dayStreak')}</div>
        </div>
      </div>

      <section className={styles.section} aria-labelledby="path-heading">
        <h2 id="path-heading" className={styles.sectionTitle}>
          {t('progress.gradePath')}
        </h2>
        <div className={styles.topicGrid}>
          {pathUnits.map((unit, index) => renderTopicRow(unit.topicId, index + 1))}
        </div>
      </section>

      {otherTopics.length > 0 ? (
        <section className={styles.section} aria-labelledby="topics-heading">
          <h2 id="topics-heading" className={styles.sectionTitle}>
            {t('progress.allTopics')}
          </h2>
          <div className={styles.topicGrid}>
            {otherTopics.map((topic) => renderTopicRow(topic.id))}
          </div>
        </section>
      ) : null}

      <section className={styles.section} aria-labelledby="lab-heading">
        <h2 id="lab-heading" className={styles.sectionTitle}>
          {t('lab.progressSection')}
        </h2>
        <div className={styles.topicGrid}>
          {labModes.map((mode) => {
            const lp = getLabModeProgress(progress, mode.id);
            return (
              <div key={mode.id} className={styles.topicRow}>
                <span className={styles.topicName}>
                  <span aria-hidden="true">{mode.emoji}</span>
                  {t(`lab.modes.${mode.id}.title`)}
                </span>
                <StarDisplay count={lp.stars as 0 | 1 | 2 | 3} />
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="badges-heading">
        <h2 id="badges-heading" className={styles.sectionTitle}>
          {t('progress.badges')}
        </h2>
        {progress.badges.length === 0 ? (
          <p className={styles.empty}>{t('progress.emptyBadges')}</p>
        ) : (
          <div className={styles.badgeGrid}>
            {progress.badges.map((badgeId) => {
              const badge = BADGE_DEFINITIONS[badgeId];
              return (
                <span key={badgeId} className={styles.badge}>
                  <span aria-hidden="true">{badge?.emoji ?? '🏅'}</span>
                  {badgeLabel(badgeId)}
                </span>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Confetti } from '../Confetti';
import { BackButton } from '../BackButton';
import { BigButton } from '../BigButton';
import { StarDisplay } from '../StarDisplay';
import { useLanguage } from '../../context/LanguageContext';
import type { TopicExamResult } from '../../lib/exam/examProgress';
import { formatExamDate } from '../../lib/exam/examConfig';
import styles from './ExamResults.module.css';

interface ExamResultsProps {
  studentName: string;
  gradeLabel: string;
  correct: number;
  total: number;
  stars: 0 | 1 | 2 | 3;
  topicResults: TopicExamResult[];
  topicLabel: (id: TopicExamResult['topicId']) => string;
  topicEmoji: (id: TopicExamResult['topicId']) => string;
  onTryAgain: () => void;
  onExit: () => void;
}

export function ExamResults({
  studentName,
  gradeLabel,
  correct,
  total,
  stars,
  topicResults,
  topicLabel,
  topicEmoji,
  onTryAgain,
  onExit,
}: ExamResultsProps) {
  const { t } = useLanguage();
  const sortedTopics = [...topicResults].sort(
    (a, b) => a.correct / a.total - b.correct / b.total,
  );
  const weakTopics = sortedTopics.filter((item) => item.correct / item.total < 0.8);

  return (
    <div className={styles.screen}>
      <BackButton label={t('exam.backHome')} onClick={onExit} />
      <Confetti active={stars >= 2} count={stars >= 2 ? 60 : 20} />

      <div className={styles.certificate}>
        <span className={styles.seal} aria-hidden="true">
          🎓
        </span>
        <h2 className={styles.title}>{t('exam.resultsTitle')}</h2>
        <p className={styles.subtitle}>
          {studentName
            ? t('exam.certificateNamed', { name: studentName, grade: gradeLabel })
            : t('exam.certificate', { grade: gradeLabel })}
        </p>
        <p className={styles.date}>{formatExamDate()}</p>
        <p className={styles.score}>
          {correct}/{total}
        </p>
        <StarDisplay count={stars} large />
        <p className={styles.encouragement}>
          {stars === 3
            ? t('exam.perfectExam')
            : stars >= 2
              ? t('exam.greatExam')
              : stars >= 1
                ? t('exam.goodExam')
                : t('exam.keepStudying')}
        </p>
      </div>

      <section className={styles.breakdown} aria-labelledby="topic-breakdown-heading">
        <h3 id="topic-breakdown-heading" className={styles.breakdownTitle}>
          {t('exam.topicBreakdown')}
        </h3>
        <ul className={styles.breakdownList}>
          {topicResults.map((item) => {
            const pct = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
            return (
              <li key={item.topicId} className={styles.breakdownItem}>
                <div className={styles.breakdownHeader}>
                  <span>
                    {topicEmoji(item.topicId)} {topicLabel(item.topicId)}
                  </span>
                  <span>
                    {item.correct}/{item.total}
                  </span>
                </div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {weakTopics.length > 0 ? (
        <section className={styles.practiceLinks} aria-labelledby="practice-more-heading">
          <h3 id="practice-more-heading" className={styles.practiceTitle}>
            {t('exam.practiceWeak')}
          </h3>
          <div className={styles.linkRow}>
            {weakTopics.slice(0, 3).map((item) => (
              <Link
                key={item.topicId}
                to={`/practice?topic=${item.topicId}`}
                className={styles.practiceLink}
              >
                {topicEmoji(item.topicId)} {topicLabel(item.topicId)}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className={styles.actions}>
        <BigButton onClick={onTryAgain} fullWidth>
          {t('exam.tryAgain')}
        </BigButton>
        <BigButton onClick={onExit} variant="outline" fullWidth>
          {t('exam.backHome')}
        </BigButton>
      </div>
    </div>
  );
}

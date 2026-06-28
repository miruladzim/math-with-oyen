import { Confetti } from '../Confetti';
import { BigButton } from '../BigButton';
import { KidHint } from '../KidHint';
import { useLanguage } from '../../context/LanguageContext';
import type { TopicExamResult } from '../../lib/exam/examProgress';
import { getExamSectionConfig } from '../../lib/exam/examConfig';
import styles from './ExamCheckpoint.module.css';

interface ExamCheckpointProps {
  sectionIndex: number;
  sectionCorrect: number;
  sectionTotal: number;
  topicStats: TopicExamResult[];
  topicLabel: (id: TopicExamResult['topicId']) => string;
  coachMessage: string;
  onContinue: () => void;
}

export function ExamCheckpoint({
  sectionIndex,
  sectionCorrect,
  sectionTotal,
  topicStats,
  topicLabel,
  coachMessage,
  onContinue,
}: ExamCheckpointProps) {
  const { t } = useLanguage();
  const section = getExamSectionConfig(sectionIndex);
  const pct = sectionTotal > 0 ? sectionCorrect / sectionTotal : 0;
  const celebrate = pct >= 0.8;

  return (
    <div className={`${styles.screen} ${styles[`theme_${section.themeClass}`]}`}>
      <Confetti active={celebrate} count={celebrate ? 35 : 0} />
      <div className={styles.card}>
        <span className={styles.badge} aria-hidden="true">
          {celebrate ? '🌟' : '💪'}
        </span>
        <h2 className={styles.title}>{t('exam.checkpointTitle')}</h2>
        <p className={styles.sectionName}>{t(section.labelKey)}</p>
        <p className={styles.score}>
          {t('exam.sectionScore', { correct: sectionCorrect, total: sectionTotal })}
        </p>

        <KidHint variant={celebrate ? 'encourage' : 'tip'} message={coachMessage} />

        <ul className={styles.topicList}>
          {topicStats.map((stat) => (
            <li key={stat.topicId} className={styles.topicChip}>
              <span>{topicLabel(stat.topicId)}</span>
              <span className={styles.chipScore}>
                {stat.correct}/{stat.total}
              </span>
            </li>
          ))}
        </ul>

        <BigButton onClick={onContinue} fullWidth>
          {sectionIndex >= 2 ? t('exam.seeResults') : t('exam.continueQuest')}
        </BigButton>
      </div>
    </div>
  );
}

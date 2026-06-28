import { useEffect, useMemo, useState } from 'react';
import { BigButton } from '../components/BigButton';
import { StarDisplay } from '../components/StarDisplay';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { getAccuracy, getTopicProgress, resetProgress, updateSettings } from '../lib/progress';
import { getAllTopics, getTopicsForGrade } from '../lib/questions';
import { createWorksheet, formatQuestionForPrint } from '../lib/worksheets';
import type { GradeLevel, TopicId } from '../lib/types';
import styles from './Teacher.module.css';

export function Teacher() {
  const { progress, setProgress, refreshProgress } = useProgress();
  const { t, language, gradeLabel, topicLabel } = useLanguage();
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [worksheetGrade, setWorksheetGrade] = useState<GradeLevel>(progress.gradeLevel);
  const [worksheetTopic, setWorksheetTopic] = useState<TopicId>('counting');
  const [worksheetCount, setWorksheetCount] = useState<10 | 20 | 30>(20);
  const [worksheet, setWorksheet] = useState(() =>
    createWorksheet(progress.gradeLevel, 'counting', 20, language, t('teacher.practiceSuffix')),
  );

  const topics = useMemo(() => getAllTopics(language), [language]);
  const gradeTopics = useMemo(() => getTopicsForGrade(worksheetGrade, language), [worksheetGrade, language]);

  const gradeOptions = (['k1', 'grade2', 'grade3', 'grade45'] as GradeLevel[]);

  const worksheetNameLine = progress.studentName
    ? t('teacher.nameLineFilled', { name: progress.studentName })
    : t('teacher.nameLine');

  useEffect(() => {
    setWorksheet(
      createWorksheet(
        worksheetGrade,
        worksheetTopic,
        worksheetCount,
        language,
        t('teacher.practiceSuffix'),
      ),
    );
  }, [language, t, worksheetCount, worksheetGrade, worksheetTopic]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === progress.settings.teacherPin) {
      setUnlocked(true);
      setPinError(false);
      if (!progress.settings.pinHintDismissed) {
        setProgress(updateSettings(progress, { pinHintDismissed: true }));
      }
    } else {
      setPinError(true);
    }
  };

  const handleGenerateWorksheet = () => {
    setWorksheet(
      createWorksheet(
        worksheetGrade,
        worksheetTopic,
        worksheetCount,
        language,
        t('teacher.practiceSuffix'),
      ),
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (window.confirm(t('teacher.resetConfirm'))) {
      const fresh = resetProgress();
      setProgress(fresh);
      refreshProgress();
      setWorksheetGrade('k1');
      setWorksheetTopic('counting');
      setWorksheetCount(20);
    }
  };

  const handleChangePin = () => {
    if (newPin.length === 4 && /^\d+$/.test(newPin)) {
      setProgress(updateSettings(progress, { teacherPin: newPin, pinHintDismissed: true }));
      setNewPin('');
    }
  };

  if (!unlocked) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('teacher.title')}</h1>
          <p className={styles.subtitle}>{t('teacher.subtitle')}</p>
        </div>

        <form className={styles.pinCard} onSubmit={handlePinSubmit}>
          <label htmlFor="teacher-pin">{t('teacher.pin')}</label>
          <input
            id="teacher-pin"
            type="password"
            inputMode="numeric"
            maxLength={4}
            className={styles.pinInput}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
            aria-invalid={pinError}
            aria-describedby={pinError ? 'pin-error' : undefined}
          />
          {pinError && (
            <p id="pin-error" role="alert" style={{ color: 'var(--color-error)' }}>
              {t('teacher.pinWrong')}
            </p>
          )}
          <BigButton type="submit" fullWidth>
            {t('teacher.unlock')}
          </BigButton>
          <p className={styles.pinHint}>
            {progress.settings.pinHintDismissed ? t('teacher.pinHintHidden') : t('teacher.pinHint')}
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.header} no-print`}>
        <h1 className={styles.title}>{t('teacher.dashboardTitle')}</h1>
        <p className={styles.subtitle}>{t('teacher.dashboardSubtitle')}</p>
      </div>

      <section className={`${styles.section} no-print`} aria-labelledby="stats-heading">
        <h2 id="stats-heading" className={styles.sectionTitle}>
          {t('teacher.progressSummary')}
        </h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('teacher.topic')}</th>
              <th>{t('teacher.stars')}</th>
              <th>{t('teacher.accuracy')}</th>
              <th>{t('teacher.answered')}</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => {
              const tp = getTopicProgress(progress, topic.id);
              return (
                <tr key={topic.id}>
                  <td>
                    {topic.emoji} {topicLabel(topic.id)}
                  </td>
                  <td>
                    <StarDisplay count={tp.stars as 0 | 1 | 2 | 3} />
                  </td>
                  <td>{getAccuracy(tp)}%</td>
                  <td>{tp.totalAnswered}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          {t('teacher.streakBadges', {
            streak: progress.streak,
            badges: progress.badges.length,
          })}
        </p>
      </section>

      <section className={`${styles.section} no-print`} aria-labelledby="worksheet-heading">
        <h2 id="worksheet-heading" className={styles.sectionTitle}>
          {t('teacher.worksheetGenerator')}
        </h2>

        <div className={styles.formRow}>
          <label>
            {t('teacher.grade')}
            <select
              value={worksheetGrade}
              onChange={(e) => {
                const grade = e.target.value as GradeLevel;
                setWorksheetGrade(grade);
                const firstTopic = getTopicsForGrade(grade, language)[0].id;
                setWorksheetTopic(firstTopic);
              }}
            >
              {gradeOptions.map((g) => (
                <option key={g} value={g}>
                  {gradeLabel(g)}
                </option>
              ))}
            </select>
          </label>

          <label>
            {t('teacher.topicSelect')}
            <select
              value={worksheetTopic}
              onChange={(e) => setWorksheetTopic(e.target.value as TopicId)}
            >
              {gradeTopics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            {t('teacher.questions')}
            <select
              value={worksheetCount}
              onChange={(e) => setWorksheetCount(Number(e.target.value) as 10 | 20 | 30)}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </label>
        </div>

        <div className={styles.actions}>
          <BigButton onClick={handleGenerateWorksheet}>{t('teacher.generate')}</BigButton>
          <BigButton variant="secondary" onClick={handlePrint}>
            {t('teacher.print')}
          </BigButton>
        </div>

        <div className={styles.worksheetPreview}>
          <h3>{worksheet.title}</h3>
          <p className={styles.subtitle}>
            {gradeLabel(worksheet.grade)} · {worksheet.createdAt}
          </p>
          <ol>
            {worksheet.questions.map((q, i) => (
              <li key={q.id}>{formatQuestionForPrint(q, i)}</li>
            ))}
          </ol>
        </div>
      </section>

      <div className="worksheet-print">
        <h1>{worksheet.title}</h1>
        <p className="worksheet-meta">
          {gradeLabel(worksheet.grade)} · {worksheet.createdAt} · {worksheetNameLine}
        </p>
        <ol>
          {worksheet.questions.map((q, i) => (
            <li key={q.id}>{formatQuestionForPrint(q, i)}</li>
          ))}
        </ol>
        <div className="answer-key">
          <h2>{t('teacher.answerKey')}</h2>
          <ol>
            {worksheet.questions.map((q, i) => (
              <li key={q.id}>
                {i + 1}. {q.correctAnswer}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <section className={`${styles.section} no-print`} aria-labelledby="settings-heading">
        <h2 id="settings-heading" className={styles.sectionTitle}>
          {t('teacher.settings')}
        </h2>
        <div className={styles.formRow}>
          <label>
            {t('teacher.newPin')}
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              className={styles.pinInput}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            />
          </label>
          <BigButton onClick={handleChangePin} variant="outline" small disabled={newPin.length !== 4}>
            {t('teacher.updatePin')}
          </BigButton>
        </div>

        <div className={styles.dangerZone}>
          <BigButton onClick={handleReset} variant="outline">
            {t('teacher.resetProgress')}
          </BigButton>
        </div>
      </section>
    </div>
  );
}

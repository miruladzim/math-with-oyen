import { useCallback, useEffect, useMemo, useState } from 'react';
import { BigButton } from '../components/BigButton';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { KidHint } from '../components/KidHint';
import { StarDisplay } from '../components/StarDisplay';
import { TeacherSectionNav, type TeacherSectionId } from '../components/TeacherSectionNav';
import {
  WorksheetAnswerKey,
  WorksheetQuestions,
} from '../components/worksheet/WorksheetQuestions';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import {
  getTeacherDashboardHint,
  getTeacherLockHint,
  getTeacherProgressHint,
  getTeacherSettingsHint,
  getTeacherWorksheetHint,
} from '../lib/hints';
import { getAccuracy, getTopicProgress, resetProgress, updateSettings } from '../lib/progress';
import { getTopicsForGrade } from '../lib/questions';
import { createWorksheet } from '../lib/worksheets';
import type { GradeLevel, TopicId } from '../lib/types';
import styles from './Teacher.module.css';

const PREVIEW_LIMIT = 3;

export function Teacher() {
  const { progress, setProgress, refreshProgress } = useProgress();
  const { t, language, gradeLabel, topicLabel } = useLanguage();
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [showAllGrades, setShowAllGrades] = useState(false);
  const [worksheetGrade, setWorksheetGrade] = useState<GradeLevel>(progress.gradeLevel);
  const [worksheetTopic, setWorksheetTopic] = useState<TopicId>('counting');
  const [worksheetCount, setWorksheetCount] = useState<10 | 20 | 30>(20);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [worksheet, setWorksheet] = useState(() =>
    createWorksheet(progress.gradeLevel, 'counting', 20, language, t('teacher.practiceSuffix')),
  );

  const gradeTopics = useMemo(() => getTopicsForGrade(worksheetGrade, language), [worksheetGrade, language]);
  const progressTopics = useMemo(() => {
    const source = showAllGrades
      ? (['k1', 'grade2', 'grade3', 'grade45'] as GradeLevel[]).flatMap((grade) =>
          getTopicsForGrade(grade, language).map((topic) => ({ ...topic, grade })),
        )
      : getTopicsForGrade(progress.gradeLevel, language).map((topic) => ({
          ...topic,
          grade: progress.gradeLevel,
        }));

    return source;
  }, [language, progress.gradeLevel, showAllGrades]);

  const gradeOptions = ['k1', 'grade2', 'grade3', 'grade45'] as GradeLevel[];

  const worksheetNameLine = progress.studentName
    ? t('teacher.nameLineFilled', { name: progress.studentName })
    : t('teacher.nameLine');

  const practicedCount = useMemo(
    () => progressTopics.filter((topic) => getTopicProgress(progress, topic.id).totalAnswered > 0).length,
    [progress, progressTopics],
  );

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
    setPreviewExpanded(false);
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
    setPreviewExpanded(false);
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

  const jumpToSection = useCallback((sectionId: TeacherSectionId) => {
    const section = document.getElementById(sectionId);
    if (section instanceof HTMLDetailsElement) {
      section.open = true;
    }
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const previewQuestions =
    previewExpanded || worksheet.questions.length <= PREVIEW_LIMIT
      ? worksheet.questions
      : worksheet.questions.slice(0, PREVIEW_LIMIT);

  if (!unlocked) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>{t('teacher.lockEyebrow')}</p>
          <h1 className={styles.title}>{t('teacher.title')}</h1>
          <p className={styles.subtitle}>{t('teacher.subtitle')}</p>
        </div>

        <KidHint variant="howTo" message={getTeacherLockHint(language)} />

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
            autoComplete="off"
          />
          {pinError ? (
            <p id="pin-error" role="alert" className={styles.pinError}>
              {t('teacher.pinWrong')}
            </p>
          ) : null}
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

      <div className="no-print">
        <KidHint variant="howTo" message={getTeacherDashboardHint(language)} />
      </div>

      <div className="no-print">
        <TeacherSectionNav onJump={jumpToSection} />
      </div>

      <CollapsibleSection
        id="teacher-progress"
        title={t('teacher.progressSummary')}
        subtitle={t('teacher.progressHint')}
        badge={`${practicedCount}/${progressTopics.length}`}
        defaultOpen
        className="no-print"
      >
        <KidHint variant="tip" message={getTeacherProgressHint(language)} compact />

        <div className={styles.tableToolbar}>
          <button
            type="button"
            className={styles.filterToggle}
            onClick={() => setShowAllGrades((value) => !value)}
          >
            {showAllGrades
              ? t('teacher.showCurrentGradeOnly', { grade: gradeLabel(progress.gradeLevel) })
              : t('teacher.showAllGrades')}
          </button>
          <p className={styles.streakSummary}>
            {t('teacher.streakBadges', {
              streak: progress.streak,
              badges: progress.badges.length,
            })}
          </p>
        </div>

        <div className={styles.tableWrap}>
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
              {progressTopics.map((topic) => {
                const tp = getTopicProgress(progress, topic.id);
                return (
                  <tr key={`${topic.grade}-${topic.id}`}>
                    <td>
                      <span className={styles.topicCell}>
                        <span className={styles.topicEmoji} aria-hidden="true">
                          {topic.emoji}
                        </span>
                        <span className={styles.topicName}>
                          {topicLabel(topic.id)}
                          {showAllGrades ? (
                            <span className={styles.gradeTag}>{gradeLabel(topic.grade)}</span>
                          ) : null}
                        </span>
                      </span>
                    </td>
                    <td>
                      <StarDisplay count={tp.stars as 0 | 1 | 2 | 3} />
                    </td>
                    <td>{tp.totalAnswered > 0 ? `${getAccuracy(tp)}%` : '—'}</td>
                    <td>{tp.totalAnswered > 0 ? tp.totalAnswered : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="teacher-worksheets"
        title={t('teacher.worksheetGenerator')}
        subtitle={t('teacher.worksheetHint')}
        badge={String(worksheetCount)}
        defaultOpen
        className="no-print"
      >
        <KidHint variant="tip" message={getTeacherWorksheetHint(language)} compact />

        <div className={styles.stepBlock}>
          <p className={styles.stepLabel}>{t('teacher.stepPick')}</p>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('teacher.grade')}</span>
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

            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('teacher.topicSelect')}</span>
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

            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('teacher.questions')}</span>
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
        </div>

        <div className={styles.stepBlock}>
          <p className={styles.stepLabel}>{t('teacher.stepGenerate')}</p>
          <div className={styles.actions}>
            <BigButton onClick={handleGenerateWorksheet}>{t('teacher.generate')}</BigButton>
            <BigButton variant="secondary" onClick={handlePrint}>
              {t('teacher.print')}
            </BigButton>
          </div>
        </div>

        <details
          id="teacher-worksheet-preview"
          className={styles.previewCollapse}
          open={worksheet.questions.length <= PREVIEW_LIMIT}
        >
          <summary className={styles.previewSummary}>
            <span>
              <span className={styles.previewSummaryTitle}>{t('teacher.previewLabel')}</span>
              <span className={styles.previewSummaryMeta}>
                {previewExpanded || worksheet.questions.length <= PREVIEW_LIMIT
                  ? worksheet.title
                  : t('teacher.previewCollapsedHint', {
                      shown: PREVIEW_LIMIT,
                      total: worksheet.questions.length,
                    })}
              </span>
            </span>
            <span className={styles.previewChevron} aria-hidden="true">
              ▼
            </span>
          </summary>
          <div className={styles.worksheetPreview}>
            <div className={styles.previewHeader}>
              <div>
                <h3 className={styles.previewTitle}>{worksheet.title}</h3>
                <p className={styles.previewMeta}>
                  {gradeLabel(worksheet.grade)} · {worksheet.createdAt} · {worksheetNameLine}
                </p>
              </div>
            </div>
            <WorksheetQuestions
              questions={previewQuestions}
              choicesLabel={t('teacher.choicesLabel')}
              answerLineLabel={t('teacher.answerLine')}
              variant="preview"
            />
            {worksheet.questions.length > PREVIEW_LIMIT ? (
              <button
                type="button"
                className={styles.previewToggle}
                onClick={() => setPreviewExpanded((value) => !value)}
              >
                {previewExpanded
                  ? t('teacher.previewShowLess')
                  : t('teacher.previewShowAll', { count: worksheet.questions.length })}
              </button>
            ) : null}
          </div>
        </details>
      </CollapsibleSection>

      <div className="worksheet-print">
        <h1>{worksheet.title}</h1>
        <p className="worksheet-meta">
          {gradeLabel(worksheet.grade)} · {worksheet.createdAt} · {worksheetNameLine}
        </p>
        <WorksheetQuestions
          questions={worksheet.questions}
          choicesLabel={t('teacher.choicesLabel')}
          answerLineLabel={t('teacher.answerLine')}
          variant="print"
        />
        <div className="answer-key">
          <h2>{t('teacher.answerKey')}</h2>
          <WorksheetAnswerKey questions={worksheet.questions} />
        </div>
      </div>

      <CollapsibleSection
        id="teacher-settings"
        title={t('teacher.settings')}
        subtitle={t('teacher.settingsSubtitle')}
        defaultOpen={false}
        className="no-print"
      >
        <KidHint variant="help" message={getTeacherSettingsHint(language)} compact />

        <div className={styles.settingsBlock}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{t('teacher.newPin')}</span>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              className={styles.pinInputInline}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              autoComplete="off"
            />
          </label>
          <BigButton onClick={handleChangePin} variant="outline" small disabled={newPin.length !== 4}>
            {t('teacher.updatePin')}
          </BigButton>
        </div>

        <div className={styles.dangerZone}>
          <p className={styles.dangerLabel}>{t('teacher.resetProgress')}</p>
          <p className={styles.dangerHint}>{t('teacher.resetConfirm')}</p>
          <BigButton onClick={handleReset} variant="outline">
            {t('teacher.resetProgress')}
          </BigButton>
        </div>
      </CollapsibleSection>
    </div>
  );
}

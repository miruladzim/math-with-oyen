import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import { BigButton } from '../components/BigButton';
import { ExamCheckpoint } from '../components/exam/ExamCheckpoint';
import { ExamChoiceBoard } from '../components/exam/ExamChoiceBoard';
import { ExamHUD } from '../components/exam/ExamHUD';
import { ExamResults } from '../components/exam/ExamResults';
import { FadeView } from '../components/FadeView';
import { KidHint } from '../components/KidHint';
import { StarDisplay } from '../components/StarDisplay';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { playCorrect, playIncorrect, playSuccess } from '../lib/audio';
import { buildFinalExam, getTopicEmoji, type ExamPaper } from '../lib/exam/examBuilder';
import { EXAM_TOTAL_QUESTIONS } from '../lib/exam/examConfig';
import {
  aggregateTopicResults,
  getFinalExamProgress,
  recordFinalExam,
} from '../lib/exam/examProgress';
import {
  getExamCheckpointHint,
  getExamIntroHint,
  getExamQuizHint,
  getExamWrongHint,
  getPracticeTopicHint,
} from '../lib/hints';
import { getTopicsForGrade } from '../lib/questions';
import { getTopicProgress, starsFromAccuracy } from '../lib/progress';
import type { TopicId } from '../lib/types';
import styles from './FinalExam.module.css';

type Phase = 'intro' | 'quiz' | 'checkpoint' | 'results';

interface AnswerRecord {
  topicId: TopicId;
  correct: boolean;
  sectionIndex: number;
}

export function FinalExam() {
  const navigate = useNavigate();
  const { progress, setProgress, gradeLevel } = useProgress();
  const { t, language, gradeLabel, topicLabel } = useLanguage();

  const [phase, setPhase] = useState<Phase>('intro');
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [checkpointSection, setCheckpointSection] = useState(0);
  const [hintUsedThisSection, setHintUsedThisSection] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [boardResetKey, setBoardResetKey] = useState(0);
  const [waitingForContinue, setWaitingForContinue] = useState(false);
  const examFinishedRef = useRef(false);

  const topics = useMemo(() => getTopicsForGrade(gradeLevel, language), [gradeLevel, language]);
  const examRecord = getFinalExamProgress(progress, gradeLevel);

  const currentQuestion = paper?.questions[questionIndex];
  const sectionIndex = Math.floor(questionIndex / 5);

  const resetExam = useCallback(() => {
    setPhase('intro');
    setPaper(null);
    setQuestionIndex(0);
    setCorrectCount(0);
    setAnswers([]);
    setCheckpointSection(0);
    setHintUsedThisSection(false);
    setActiveHint(null);
    setBoardResetKey(0);
    setWaitingForContinue(false);
    examFinishedRef.current = false;
  }, []);

  const startExam = () => {
    const nextPaper = buildFinalExam(gradeLevel, language);
    setPaper(nextPaper);
    setQuestionIndex(0);
    setCorrectCount(0);
    setAnswers([]);
    setCheckpointSection(0);
    setHintUsedThisSection(false);
    setActiveHint(null);
    setBoardResetKey((k) => k + 1);
    setWaitingForContinue(false);
    examFinishedRef.current = false;
    setPhase('quiz');
  };

  const finishExam = useCallback(
    (finalAnswers: AnswerRecord[], finalCorrect: number) => {
      if (examFinishedRef.current) return;
      examFinishedRef.current = true;
      const topicResults = aggregateTopicResults(finalAnswers);
      const updated = recordFinalExam(
        progress,
        gradeLevel,
        finalCorrect,
        EXAM_TOTAL_QUESTIONS,
        topicResults,
      );
      setProgress(updated);
      playSuccess();
      setPhase('results');
    },
    [gradeLevel, progress, setProgress],
  );

  const handleAnswer = (correct: boolean) => {
    if (!currentQuestion || waitingForContinue) return;
    setWaitingForContinue(true);
    if (correct) {
      playCorrect();
      setCorrectCount((c) => c + 1);
    } else {
      playIncorrect();
    }
    setAnswers((prev) => [
      ...prev,
      {
        topicId: currentQuestion.topicId,
        correct,
        sectionIndex: currentQuestion.sectionIndex,
      },
    ]);
  };

  const handleContinue = () => {
    if (!waitingForContinue) return;

    const nextIndex = questionIndex + 1;
    setWaitingForContinue(false);
    setActiveHint(null);

    if (nextIndex >= EXAM_TOTAL_QUESTIONS) {
      const totalCorrect = answers.filter((a) => a.correct).length;
      finishExam(answers, totalCorrect);
      return;
    }

    if (nextIndex === 5 || nextIndex === 10) {
      setCheckpointSection(Math.floor(questionIndex / 5));
      setQuestionIndex(nextIndex);
      setHintUsedThisSection(false);
      setBoardResetKey((k) => k + 1);
      setPhase('checkpoint');
      return;
    }

    setQuestionIndex(nextIndex);
    setBoardResetKey((k) => k + 1);
  };

  const handleCheckpointContinue = () => {
    if (!paper) return;
    setHintUsedThisSection(false);
    setActiveHint(null);
    setPhase('quiz');
  };

  const handleUseHint = () => {
    if (!currentQuestion || hintUsedThisSection) return;
    const hint =
      currentQuestion.hint ?? getPracticeTopicHint(language, currentQuestion.topicId);
    setActiveHint(hint);
    setHintUsedThisSection(true);
  };

  const sectionAnswers = answers.filter((a) => a.sectionIndex === checkpointSection);
  const sectionTopicStats = aggregateTopicResults(sectionAnswers);
  const sectionCorrect = sectionAnswers.filter((a) => a.correct).length;
  const topicResults = aggregateTopicResults(answers);
  const resultsStars = starsFromAccuracy(
    answers.filter((a) => a.correct).length,
    EXAM_TOTAL_QUESTIONS,
  );

  let content: ReactNode;

  if (phase === 'intro') {
    content = (
      <div className={styles.page}>
        <BackButton label={t('exam.backHome')} onClick={() => navigate('/')} />
        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">
            🎓
          </span>
          <h1 className={styles.title}>{t('exam.title')}</h1>
          <p className={styles.subtitle}>{t('exam.subtitle', { grade: gradeLabel(gradeLevel) })}</p>
        </header>

        <section className={styles.coachSection}>
          <KidHint variant="howTo" message={getExamIntroHint(language)} />
        </section>

        {examRecord ? (
          <div className={styles.bestScore}>
            <p className={styles.bestLabel}>{t('exam.bestScore')}</p>
            <p className={styles.bestValue}>
              {examRecord.bestCorrect}/{examRecord.bestTotal}
            </p>
            <StarDisplay count={examRecord.bestStars} />
          </div>
        ) : null}

        <section className={styles.readiness} aria-labelledby="readiness-heading">
          <h2 id="readiness-heading" className={styles.readinessTitle}>
            {t('exam.readinessTitle')}
          </h2>
          <ul className={styles.readinessList}>
            {topics.map((topic) => {
              const tp = getTopicProgress(progress, topic.id);
              return (
                <li key={topic.id} className={styles.readinessItem}>
                  <span className={styles.topicRow}>
                    <span className={styles.topicEmoji} aria-hidden="true">
                      {topic.emoji}
                    </span>
                    <span className={styles.topicLabel}>{topic.label}</span>
                  </span>
                  <StarDisplay count={tp.stars as 0 | 1 | 2 | 3} />
                </li>
              );
            })}
          </ul>
        </section>

        <div className={styles.ctaWrap}>
          <BigButton onClick={startExam} fullWidth>
            {t('exam.startExam')}
          </BigButton>
        </div>
      </div>
    );
  } else if (phase === 'quiz' && currentQuestion && paper) {
    content = (
      <div className={`${styles.page} ${styles.quizPage}`}>
        <BackButton label={t('exam.quitExam')} onClick={resetExam} />

        <ExamHUD
          sectionIndex={sectionIndex}
          questionIndex={questionIndex}
          totalQuestions={EXAM_TOTAL_QUESTIONS}
          correctCount={correctCount}
          answeredCount={answers.length}
          hintAvailable={Boolean(currentQuestion.hint || currentQuestion.topicId)}
          hintUsed={hintUsedThisSection}
          onUseHint={handleUseHint}
          currentQuestion={currentQuestion}
        />

        <KidHint
          variant="tip"
          message={
            waitingForContinue &&
            answers.length > 0 &&
            answers[answers.length - 1]?.correct === false
              ? getExamWrongHint(language, currentQuestion.topicId)
              : getExamQuizHint(language)
          }
        />

        <ExamChoiceBoard
          question={currentQuestion}
          questionNumber={questionIndex + 1}
          totalQuestions={EXAM_TOTAL_QUESTIONS}
          topicLabel={topicLabel(currentQuestion.topicId)}
          hintText={activeHint}
          onAnswer={handleAnswer}
          onContinue={handleContinue}
          disabled={false}
          resetKey={boardResetKey}
        />
      </div>
    );
  } else if (phase === 'checkpoint') {
    content = (
      <div className={styles.page}>
        <BackButton label={t('exam.quitExam')} onClick={resetExam} />
        <ExamCheckpoint
          sectionIndex={checkpointSection}
          sectionCorrect={sectionCorrect}
          sectionTotal={sectionAnswers.length}
          topicStats={sectionTopicStats}
          topicLabel={topicLabel}
          coachMessage={getExamCheckpointHint(language, sectionCorrect, sectionAnswers.length)}
          onContinue={handleCheckpointContinue}
        />
      </div>
    );
  } else if (phase === 'results') {
    content = (
      <ExamResults
        studentName={progress.studentName}
        gradeLabel={gradeLabel(gradeLevel)}
        correct={answers.filter((a) => a.correct).length}
        total={EXAM_TOTAL_QUESTIONS}
        stars={resultsStars}
        topicResults={topicResults}
        topicLabel={topicLabel}
        topicEmoji={getTopicEmoji}
        onTryAgain={startExam}
        onExit={() => navigate('/')}
      />
    );
  } else {
    content = (
      <div className={styles.page}>
        <BackButton label={t('exam.backHome')} onClick={resetExam} />
        <p className={styles.subtitle}>{t('exam.startExam')}</p>
        <BigButton onClick={startExam} fullWidth>
          {t('exam.startExam')}
        </BigButton>
      </div>
    );
  }

  return (
    <FadeView viewKey={phase} scrollTopOnEnter>
      {content}
    </FadeView>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import { Confetti } from '../components/Confetti';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { BigButton } from '../components/BigButton';
import { FadeView } from '../components/FadeView';
import { HintButton } from '../components/HintButton';
import { KidHint, type HintMood } from '../components/KidHint';
import { PreschoolShell } from '../components/preschool/PreschoolShell';
import { PreschoolVictory } from '../components/preschool/PreschoolVictory';
import { TapToCountBoard } from '../components/preschool/TapToCountBoard';
import { CompareBoard } from '../components/preschool/CompareBoard';
import { PatternBoard } from '../components/preschool/PatternBoard';
import { StarDisplay } from '../components/StarDisplay';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { useAdaptiveDifficulty, applyAdaptiveAnswer } from '../hooks/useAdaptiveDifficulty';
import { useHintButton } from '../hooks/useHintButton';
import {
  getPracticePath,
  getPracticeUnit,
  getTopicBadge,
} from '../lib/curriculum/practicePath';
import { pickRandom, translations } from '../lib/i18n/translations';
import { playCorrect, playIncorrect, playSuccess } from '../lib/audio';
import { CORRECT_FEEDBACK_MS } from '../lib/feedbackTiming';
import {
  getNextPracticeSteps,
  getRecommendedTopic,
  getTopicProgress,
  recordSession,
  starsFromAccuracy,
} from '../lib/progress';
import {
  getOyenAskPracticeHint,
  getPracticePickHint,
  getPracticeTopicHint,
  getPracticeWrongHint,
} from '../lib/hints';
import { generateQuestion, getTopicsForGrade } from '../lib/questions';
import { speak } from '../lib/speech';
import {
  getPracticeSessionSize,
  isCompareTopic,
  isPatternTopic,
  isPreschool,
  isTapCountTopic,
} from '../lib/preschoolConfig';
import type { LabModeId, Question, TopicId } from '../lib/types';
import { QuestionCard } from '../components/QuestionCard';
import styles from './Practice.module.css';
const REVIEW_MIX_SIZE = 5;

type Phase = 'pick' | 'quiz' | 'recap' | 'done';

interface MissedQuestion {
  prompt: string;
  correctAnswer: number | string;
  hint?: string;
  strategyHint: string;
  choices?: (number | string)[];
  inputType: 'choice' | 'number';
}

export function Practice() {
  const { progress, setProgress, gradeLevel, patchSettings } = useProgress();
  const { t, language, gradeLabel, topicLabel } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [phase, setPhase] = useState<Phase>('pick');
  const [topicId, setTopicId] = useState<TopicId | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [waiting, setWaiting] = useState(false);
  const [awaitingAction, setAwaitingAction] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [questionResetKey, setQuestionResetKey] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<MissedQuestion[]>([]);
  const [labSuggestion, setLabSuggestion] = useState<LabModeId | null>(null);
  const [isReviewMix, setIsReviewMix] = useState(false);
  const firstAttemptCorrect = useRef(true);
  const prevLanguage = useRef(language);
  const advanceTimer = useRef<number | null>(null);

  const {
    difficulty,
    streakCorrect,
    streakWrong,
    peakDifficulty,
    resetAdaptive,
    recordAnswer,
  } = useAdaptiveDifficulty(1);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);

  useEffect(() => clearAdvanceTimer, [clearAdvanceTimer]);

  const pathUnits = useMemo(() => getPracticePath(gradeLevel), [gradeLevel]);
  const topics = useMemo(
    () => getTopicsForGrade(gradeLevel, language),
    [gradeLevel, language],
  );
  const recommendedTopicId = useMemo(
    () => getRecommendedTopic(progress),
    [progress],
  );
  const nextSteps = useMemo(() => getNextPracticeSteps(progress, 3), [progress]);

  const oyenAskCount = useRef(0);

  const getOyenAskHint = useCallback(() => {
    if (!topicId) return pickRandom(translations[language].hints.encourage);
    const message = getOyenAskPracticeHint(language, topicId, oyenAskCount.current);
    oyenAskCount.current += 1;
    return message;
  }, [language, topicId]);

  const { revealedMessage: oyenAskMessage, revealHint, resetHint } = useHintButton(getOyenAskHint);

  const currentQuestion = questions[currentIndex];
  const sessionSize = questions.length;

  const generateOptions = useCallback(
    (id: TopicId) => {
      const unit = getPracticeUnit(gradeLevel, id);
      const base = unit?.bondTargetMax ? { bondTargetMax: unit.bondTargetMax } : {};
      return isPreschool(gradeLevel) ? { ...base, preschool: true } : Object.keys(base).length ? base : undefined;
    },
    [gradeLevel],
  );

  const finishSession = useCallback(
    (finalCorrect: number, total: number) => {
      if (topicId && !isReviewMix) {
        const updated = recordSession(progress, topicId, finalCorrect, total, {
          peakDifficulty: peakDifficulty as 1 | 2 | 3,
        });
        setProgress(updated);
      }
      playSuccess();
      speak(
        t('practice.sessionScoreSpeech', {
          correct: finalCorrect,
          total,
        }),
      );
      setWaiting(false);
      setAwaitingAction(false);
      setPhase('done');
    },
    [isReviewMix, peakDifficulty, progress, setProgress, t, topicId],
  );

  const advanceQuestion = useCallback(
    (wasFirstAttemptCorrect: boolean, updateAdaptive = true) => {
      const nextAdaptive = updateAdaptive
        ? applyAdaptiveAnswer(
            { difficulty, streakCorrect, streakWrong, peakDifficulty },
            wasFirstAttemptCorrect,
          )
        : { difficulty, streakCorrect, streakWrong, peakDifficulty };

      if (updateAdaptive) {
        recordAnswer(wasFirstAttemptCorrect);
      }

      if (!wasFirstAttemptCorrect && nextAdaptive.streakWrong >= 2) {
        const unit = topicId ? getPracticeUnit(gradeLevel, topicId) : undefined;
        if (unit?.labModeId) {
          setLabSuggestion(unit.labModeId);
        }
      }

      if (currentIndex + 1 >= sessionSize) {
        if (missedQuestions.length > 0 && !isReviewMix) {
          setWaiting(false);
          setAwaitingAction(false);
          setPhase('recap');
          return;
        }
        finishSession(correctCount, sessionSize);
        return;
      }

      setQuestions((prev) => {
        const next = [...prev];
        next[currentIndex + 1] = generateQuestion(
          topicId!,
          nextAdaptive.difficulty,
          language,
          generateOptions(topicId!),
        );
        return next;
      });
      setCurrentIndex((i) => i + 1);
      setFeedback(null);
      setWaiting(false);
      setAwaitingAction(false);
      setIsRetry(false);
      firstAttemptCorrect.current = true;
    },
    [
      correctCount,
      currentIndex,
      difficulty,
      finishSession,
      generateOptions,
      gradeLevel,
      isReviewMix,
      language,
      missedQuestions.length,
      peakDifficulty,
      recordAnswer,
      sessionSize,
      streakCorrect,
      streakWrong,
      topicId,
    ],
  );

  const startTopic = useCallback(
    (id: TopicId, reviewMix = false) => {
      clearAdvanceTimer();
      const savedDifficulty = getTopicProgress(progress, id).savedDifficulty ?? 1;
      const startDiff = Math.max(1, Math.min(3, savedDifficulty));
      const count = reviewMix ? REVIEW_MIX_SIZE : getPracticeSessionSize(gradeLevel);
      const opts = generateOptions(id);

      const initialQuestions = Array.from({ length: count }, () =>
        generateQuestion(id, startDiff, language, opts),
      );

      setTopicId(id);
      setQuestions(initialQuestions);
      setCurrentIndex(0);
      setCorrectCount(0);
      setFeedback(null);
      setWaiting(false);
      setAwaitingAction(false);
      setIsRetry(false);
      setQuestionResetKey(0);
      setMissedQuestions([]);
      setLabSuggestion(null);
      setIsReviewMix(reviewMix);
      resetAdaptive(startDiff);
      firstAttemptCorrect.current = true;
      setPhase('quiz');
    },
    [clearAdvanceTimer, generateOptions, language, progress, resetAdaptive],
  );

  const startReviewMix = useCallback(() => {
    const weak = nextSteps.filter((step) => {
      const tp = getTopicProgress(progress, step.topicId);
      return tp.stars < 2 || (tp.totalAnswered >= 10 && tp.totalCorrect / tp.totalAnswered < 0.7);
    });
    const pick = weak[0]?.topicId ?? recommendedTopicId;
    startTopic(pick, true);
  }, [nextSteps, progress, recommendedTopicId, startTopic]);

  useEffect(() => {
    resetHint();
    oyenAskCount.current = 0;
  }, [currentIndex, topicId, resetHint]);

  useEffect(() => {
    if (prevLanguage.current === language) return;
    prevLanguage.current = language;
    clearAdvanceTimer();
    if (phase === 'quiz') {
      setPhase('pick');
      setTopicId(null);
      setQuestions([]);
      setCurrentIndex(0);
      setCorrectCount(0);
      setFeedback(null);
      setWaiting(false);
      setAwaitingAction(false);
    }
  }, [language, phase, clearAdvanceTimer]);

  useEffect(() => {
    const topicParam = searchParams.get('topic') as TopicId | null;
    if (topicParam && topics.some((topic) => topic.id === topicParam)) {
      startTopic(topicParam);
      setSearchParams({}, { replace: true });
      patchSettings({ onboardingDone: true });
    }
  }, [searchParams, setSearchParams, topics, patchSettings, startTopic]);

  const handleAnswer = useCallback(
    (_answer: string | number, correct: boolean) => {
      if (waiting && !awaitingAction) return;
      if (isRetry && !correct) return;

      clearAdvanceTimer();
      setWaiting(true);

      if (correct) {
        if (!isRetry) {
          setCorrectCount((c) => c + 1);
        }
        const msg = pickRandom(translations[language].practice.correctMessages);
        setFeedback({ type: 'success', message: msg });
        speak(msg);
        playCorrect();
        if (!isRetry) {
          setLabSuggestion(null);
        }
        advanceTimer.current = window.setTimeout(() => {
          if (isRetry) {
            advanceQuestion(firstAttemptCorrect.current, false);
          } else {
            advanceQuestion(true, true);
          }
        }, CORRECT_FEEDBACK_MS);
        return;
      }

      if (isRetry) return;

      firstAttemptCorrect.current = false;
      const msg = pickRandom(translations[language].practice.wrongMessages);
      const answerReveal = t('victory.answerWas', {
        answer: String(currentQuestion?.correctAnswer ?? ''),
      });
      setFeedback({ type: 'error', message: `${msg} ${answerReveal}` });
      speak(answerReveal);
      playIncorrect();

      if (currentQuestion && topicId) {
        setMissedQuestions((prev) => [
          ...prev,
          {
            prompt: currentQuestion.prompt,
            correctAnswer: currentQuestion.correctAnswer,
            hint: currentQuestion.hint,
            strategyHint: getPracticeTopicHint(language, topicId),
            choices: currentQuestion.choices,
            inputType: currentQuestion.inputType,
          },
        ]);
      }

      const unit = topicId ? getPracticeUnit(gradeLevel, topicId) : undefined;
      if (unit?.labModeId && streakWrong >= 1) {
        setLabSuggestion(unit.labModeId);
      }

      setAwaitingAction(true);
    },
    [
      advanceQuestion,
      awaitingAction,
      clearAdvanceTimer,
      currentQuestion,
      gradeLevel,
      isRetry,
      language,
      recordAnswer,
      t,
      topicId,
      waiting,
      streakWrong,
    ],
  );

  const handleTryAgain = () => {
    clearAdvanceTimer();
    setIsRetry(true);
    setFeedback(null);
    setWaiting(false);
    setAwaitingAction(false);
    setQuestionResetKey((k) => k + 1);
  };

  const handleNextQuestion = () => {
    clearAdvanceTimer();
    advanceQuestion(firstAttemptCorrect.current);
  };

  const startMissedReview = () => {
    const reviewSlice = missedQuestions.slice(0, 3);
    const reviewQuestions = reviewSlice.map((item, index) => ({
      id: `missed-review-${index}-${Date.now()}`,
      topicId: topicId!,
      prompt: item.prompt,
      correctAnswer: item.correctAnswer,
      choices: item.choices,
      inputType: item.inputType,
      difficulty: 1,
      hint: item.hint,
    }));
    setQuestions(reviewQuestions);
    setCurrentIndex(0);
    setCorrectCount(0);
    setMissedQuestions([]);
    setFeedback(null);
    setWaiting(false);
    setAwaitingAction(false);
    setIsRetry(false);
    setPhase('quiz');
    resetAdaptive(1);
  };

  const reset = () => {
    clearAdvanceTimer();
    setPhase('pick');
    setTopicId(null);
    setQuestions([]);
    setCurrentIndex(0);
    setCorrectCount(0);
    setFeedback(null);
    setWaiting(false);
    setAwaitingAction(false);
    setMissedQuestions([]);
    setLabSuggestion(null);
    setIsReviewMix(false);
  };

  const coachMessage = useMemo(() => {
    if (phase !== 'quiz') return '';
    if (oyenAskMessage) return oyenAskMessage;
    if (feedback?.type === 'error' && awaitingAction) {
      const hint = currentQuestion?.hint;
      const wrong = topicId ? getPracticeWrongHint(language, topicId) : '';
      return hint ? `${wrong} ${hint}` : wrong;
    }
    if (labSuggestion && feedback?.type === 'error') {
      return `${t('practice.labSuggest')} ${t(`lab.modes.${labSuggestion}.title`)}`;
    }
    if (feedback?.type === 'success') return t('practice.mascotHappy');
    if (topicId) return getPracticeTopicHint(language, topicId);
    return pickRandom(translations[language].hints.encourage);
  }, [
    awaitingAction,
    currentQuestion?.hint,
    feedback?.type,
    labSuggestion,
    language,
    oyenAskMessage,
    phase,
    t,
    topicId,
  ]);

  const coachMood: HintMood = oyenAskMessage
    ? 'think'
    : feedback?.type === 'success'
      ? 'happy'
      : feedback?.type === 'error'
        ? 'encourage'
        : 'idle';

  const coachVariant = oyenAskMessage
    ? 'tip'
    : feedback?.type === 'error'
      ? 'help'
      : feedback?.type === 'success'
        ? 'encourage'
        : 'tip';

  const showReviewMix =
    nextSteps.some((step) => {
      const tp = getTopicProgress(progress, step.topicId);
      return tp.totalAnswered > 0 && tp.stars < 2;
    }) && progress.weeklyAnswered >= 5;

  const preschoolMode = isPreschool(gradeLevel);
  const useTapBoard =
    preschoolMode && topicId && isTapCountTopic(topicId) && currentQuestion;
  const useCompareBoard =
    preschoolMode && topicId && isCompareTopic(topicId) && currentQuestion;
  const usePatternBoard =
    preschoolMode && topicId && isPatternTopic(topicId) && currentQuestion;

  let content: ReactNode;

  if (phase === 'pick') {
    const recommendedTopic = topics.find((topic) => topic.id === recommendedTopicId);
    const pickContent = (
      <div className={styles.page}>
        <BackButton label={t('practice.backHome')} to="/" />

        <div className={styles.header}>
          <h1 className={styles.title}>{t('practice.title')}</h1>
          <p className={styles.subtitle}>
            {gradeLabel(gradeLevel)} — {t('practice.pickTopic')}
          </p>
        </div>

        {recommendedTopic ? (
          <div className={styles.upNextBanner}>
            <p className={styles.upNextLabel}>{t('practice.oyenSuggests')}</p>
            <button
              type="button"
              className={styles.upNextBtn}
              onClick={() => startTopic(recommendedTopic.id)}
            >
              <span aria-hidden="true">{recommendedTopic.emoji}</span>
              {recommendedTopic.label}
            </button>
          </div>
        ) : null}

        <KidHint variant="howTo" message={getPracticePickHint(language)} />

        {showReviewMix ? (
          <div className={styles.reviewMixCard}>
            <p className={styles.reviewMixTitle}>{t('practice.reviewMixTitle')}</p>
            <p className={styles.reviewMixDesc}>{t('practice.reviewMixDesc')}</p>
            <BigButton onClick={startReviewMix} variant="outline">
              {t('practice.startReviewMix')}
            </BigButton>
          </div>
        ) : null}

        <div className={styles.topicGrid}>
          {pathUnits.map((unit, index) => {
            const topic = topics.find((item) => item.id === unit.topicId);
            if (!topic) return null;
            const tp = getTopicProgress(progress, unit.topicId);
            const badge = getTopicBadge(unit.role, tp.stars, tp.totalAnswered);
            const isRecommended = unit.topicId === recommendedTopicId;

            const badgeLabel =
              badge === 'new'
                ? t('practice.badgeNew')
                : badge === 'review'
                  ? t('practice.badgeReview')
                  : badge === 'strong'
                    ? t('practice.badgeStrong')
                    : null;

            return (
              <button
                key={unit.topicId}
                type="button"
                className={`${styles.topicCard} ${isRecommended ? styles.topicCardRecommended : ''}`}
                onClick={() => startTopic(unit.topicId)}
              >
                <div className={styles.topicInfo}>
                  <span className={styles.stepBadge}>{t('practice.stepLabel', { n: index + 1 })}</span>
                  <span className={styles.topicEmoji} aria-hidden="true">
                    {topic.emoji}
                  </span>
                  <div className={styles.topicText}>
                    <span className={styles.topicLabel}>{topic.label}</span>
                    {badgeLabel ? (
                      <span className={`${styles.roleBadge} ${styles[`roleBadge_${badge}`]}`}>
                        {badgeLabel}
                      </span>
                    ) : null}
                  </div>
                </div>
                <StarDisplay count={tp.stars as 0 | 1 | 2 | 3} />
              </button>
            );
          })}
        </div>
      </div>
    );
    content = preschoolMode ? (
      <PreschoolShell banner={t('preschool.practiceBanner')}>{pickContent}</PreschoolShell>
    ) : (
      pickContent
    );
  } else if (phase === 'recap') {
    content = (
      <div className={styles.page}>
        <BackButton label={t('practice.backTopics')} onClick={reset} />
        <div className={styles.recapCard}>
          <h1 className={styles.title}>{t('practice.reviewTitle')}</h1>
          <p className={styles.subtitle}>{t('practice.reviewDesc')}</p>
          <ul className={styles.recapList}>
            {missedQuestions.map((item, index) => (
              <li key={index} className={styles.recapItem}>
                <p className={styles.recapPrompt}>{item.prompt}</p>
                <p className={styles.recapAnswer}>
                  {t('victory.answerWas', { answer: String(item.correctAnswer) })}
                </p>
                <p className={styles.recapHint}>{item.strategyHint}</p>
              </li>
            ))}
          </ul>
          <div className={styles.resultActions}>
            <BigButton onClick={startMissedReview} fullWidth>
              {t('practice.practiceMissed')}
            </BigButton>
            <BigButton
              onClick={() => finishSession(correctCount, sessionSize)}
              variant="outline"
              fullWidth
            >
              {t('practice.seeResults')}
            </BigButton>
          </div>
        </div>
      </div>
    );
  } else if (phase === 'done') {
    const stars = starsFromAccuracy(correctCount, sessionSize);
    const mastery = topicId ? getTopicProgress(progress, topicId).masteryLevel ?? 0 : 0;

    content = preschoolMode ? (
      <PreschoolShell banner={t('preschool.practiceBanner')}>
        <PreschoolVictory>
          <div className={styles.page}>
            <BackButton label={t('practice.backTopics')} onClick={reset} />
            <Confetti active count={stars >= 2 ? 50 : 25} />
            <div className={styles.resultCard}>
              <p className={styles.subtitle}>{t('preschool.stickerTitle')}</p>
              <span className={styles.resultTrophy} aria-hidden="true">
                {stars === 3 ? '🏆' : stars >= 1 ? '🌟' : '💪'}
              </span>
              <h1 className={styles.title}>
                {progress.studentName
                  ? t('practice.sessionCompleteNamed', { name: progress.studentName })
                  : t('practice.sessionComplete')}
              </h1>
              <p className={styles.resultScore}>
                {correctCount}/{sessionSize}
              </p>
              <StarDisplay count={stars} large />
              {mastery > 0 && !isReviewMix ? (
                <p className={styles.masteryBadge}>
                  {t('practice.masteryLabel')} {mastery}/3
                </p>
              ) : null}
              <p className={styles.subtitle} style={{ marginTop: '1rem' }}>
                {stars === 3
                  ? t('practice.perfectScore')
                  : stars >= 1
                    ? t('preschool.stickerSub')
                    : t('practice.keepGoing')}
              </p>
              <div className={styles.resultActions}>
                <BigButton onClick={() => topicId && startTopic(topicId)} fullWidth>
                  {t('practice.tryAgain')}
                </BigButton>
                <BigButton onClick={reset} variant="outline" fullWidth>
                  {t('practice.pickAnother')}
                </BigButton>
              </div>
            </div>
          </div>
        </PreschoolVictory>
      </PreschoolShell>
    ) : (
      <div className={styles.page}>
        <BackButton label={t('practice.backTopics')} onClick={reset} />
        <Confetti active count={stars >= 2 ? 50 : 25} />
        <div className={styles.resultCard}>
          <span className={styles.resultTrophy} aria-hidden="true">
            {stars === 3 ? '🏆' : stars >= 1 ? '🌟' : '💪'}
          </span>
          <h1 className={styles.title}>
            {progress.studentName
              ? t('practice.sessionCompleteNamed', { name: progress.studentName })
              : t('practice.sessionComplete')}
          </h1>
          <p className={styles.resultScore}>
            {correctCount}/{sessionSize}
          </p>
          <StarDisplay count={stars} large />
          {mastery > 0 && !isReviewMix ? (
            <p className={styles.masteryBadge}>{t('practice.masteryLabel')} {mastery}/3</p>
          ) : null}
          <p className={styles.subtitle} style={{ marginTop: '1rem' }}>
            {stars === 3
              ? t('practice.perfectScore')
              : stars >= 1
                ? t('practice.earnedStars')
                : t('practice.keepGoing')}
          </p>
          <div className={styles.resultActions}>
            <BigButton onClick={() => topicId && startTopic(topicId)} fullWidth>
              {t('practice.tryAgain')}
            </BigButton>
            <BigButton onClick={reset} variant="outline" fullWidth>
              {t('practice.pickAnother')}
            </BigButton>
          </div>
        </div>
      </div>
    );
  } else {
    const quizContent = (
    <div className={styles.page}>
      <BackButton label={t('practice.backTopics')} onClick={reset} />

      {topicId ? (
        <div className={styles.quizHeader}>
          <span className={styles.quizTopicEmoji} aria-hidden="true">
            {topics.find((topic) => topic.id === topicId)?.emoji}
          </span>
          <span className={styles.quizTopicLabel}>{topicLabel(topicId)}</span>
        </div>
      ) : null}

      {streakCorrect >= 2 && (
        <span className={styles.streakBadge} aria-live="polite">
          🔥 {t('practice.streak', { count: streakCorrect })}
        </span>
      )}

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.message} />}

      <div className={styles.quizShell}>
        <KidHint mood={coachMood} variant={coachVariant} message={coachMessage} live="polite" />

        {labSuggestion && awaitingAction ? (
          <Link to={`/lab?mode=${labSuggestion}`} className={styles.labLink}>
            {t('practice.goToLab')} — {t(`lab.modes.${labSuggestion}.title`)}
          </Link>
        ) : null}

        <div className={styles.hintRow}>
          <HintButton onClick={revealHint} disabled={waiting && !awaitingAction} />
        </div>

        {awaitingAction ? (
          <div className={styles.actionRow}>
            <BigButton onClick={handleTryAgain} variant="outline">
              {t('practice.tryAgainQuestion')}
            </BigButton>
            <BigButton onClick={handleNextQuestion}>{t('practice.nextQuestion')}</BigButton>
          </div>
        ) : null}

        {useTapBoard ? (
          <TapToCountBoard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={sessionSize}
            onAnswer={handleAnswer}
            disabled={waiting && !awaitingAction}
            resetKey={questionResetKey}
          />
        ) : useCompareBoard ? (
          <CompareBoard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={sessionSize}
            onAnswer={handleAnswer}
            disabled={waiting && !awaitingAction}
            resetKey={questionResetKey}
          />
        ) : usePatternBoard ? (
          <PatternBoard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={sessionSize}
            onAnswer={handleAnswer}
            disabled={waiting && !awaitingAction}
            resetKey={questionResetKey}
          />
        ) : currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={sessionSize}
            onAnswer={handleAnswer}
            disabled={waiting && !awaitingAction}
            resetKey={questionResetKey}
          />
        ) : null}
      </div>
    </div>
    );
    content = preschoolMode ? (
      <PreschoolShell banner={t('preschool.practiceBanner')}>{quizContent}</PreschoolShell>
    ) : (
      quizContent
    );
  }

  return (
    <FadeView viewKey={phase} scrollTopOnEnter>
      {content}
    </FadeView>
  );
}

import type { AppProgress, AppSettings, GradeLevel, LabModeId, LabModeProgress, TopicId, TopicProgress } from './types';
import { getPracticePath, getPracticeUnit, getTopicIdsForGrade } from './curriculum/practicePath';
import { VALID_GRADES } from './preschoolConfig';
import { getLabModeMeta } from './lab/labConfig';

const STORAGE_KEY = 'math-adventure-progress';

const DEFAULT_SETTINGS: AppSettings = {
  speechEnabled: false,
  soundEnabled: true,
  darkMode: false,
  teacherPin: '1234',
  language: 'en',
  onboardingDone: false,
  pinHintDismissed: false,
};

function defaultTopicProgress(): TopicProgress {
  return {
    stars: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    masteryLevel: 0,
    savedDifficulty: 1,
    perfectSessions: 0,
    sessionsAt80: 0,
  };
}

function normalizeTopicProgress(raw: TopicProgress | undefined): TopicProgress {
  const base = defaultTopicProgress();
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    masteryLevel: (raw.masteryLevel ?? 0) as 0 | 1 | 2 | 3,
    savedDifficulty: (raw.savedDifficulty ?? 1) as 1 | 2 | 3,
    perfectSessions: raw.perfectSessions ?? 0,
    sessionsAt80: raw.sessionsAt80 ?? 0,
  };
}

const REVIEW_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function computeMasteryLevel(
  current: 0 | 1 | 2 | 3,
  sessionPct: number,
  perfectSessions: number,
  sessionsAt80: number,
  peakDifficulty: number,
): 0 | 1 | 2 | 3 {
  let level = current;
  if (sessionPct >= 0.6) level = Math.max(level, 1) as 0 | 1 | 2 | 3;
  if (sessionsAt80 >= 2 || perfectSessions >= 1) level = Math.max(level, 2) as 0 | 1 | 2 | 3;
  if (perfectSessions >= 2 && peakDifficulty >= 2) level = 3;
  return level;
}

function formatLocalDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getWeekStart(): string {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  return formatLocalDate(monday);
}

export function createDefaultProgress(gradeLevel: GradeLevel = 'k1'): AppProgress {
  return {
    gradeLevel,
    studentName: '',
    topics: {},
    badges: [],
    streak: 0,
    weekStartDate: getWeekStart(),
    weeklyAnswered: 0,
    weeklyCorrect: 0,
    labModes: {},
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function loadProgress(): AppProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw) as AppProgress;
    const gradeLevel = VALID_GRADES.includes(parsed.gradeLevel) ? parsed.gradeLevel : 'k1';
    const base = createDefaultProgress(gradeLevel);
    return {
      ...base,
      ...parsed,
      studentName: sanitizeStudentName(parsed.studentName ?? ''),
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings, language: parsed.settings?.language ?? 'en' },
      topics: parsed.topics ?? {},
      badges: parsed.badges ?? [],
      labModes: parsed.labModes ?? {},
      finalExams: parsed.finalExams ?? {},
      weeklyAnswered: parsed.weeklyAnswered ?? 0,
      weeklyCorrect: parsed.weeklyCorrect ?? 0,
      weekStartDate: parsed.weekStartDate ?? getWeekStart(),
    };
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(progress: AppProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getTopicProgress(progress: AppProgress, topicId: TopicId): TopicProgress {
  return normalizeTopicProgress(progress.topics[topicId]);
}

export function starsFromAccuracy(correct: number, total: number): 0 | 1 | 2 | 3 {
  if (total === 0) return 0;
  const pct = correct / total;
  if (pct >= 1) return 3;
  if (pct >= 0.8) return 2;
  if (pct >= 0.6) return 1;
  return 0;
}

export function updateWeeklyStats(progress: AppProgress, correct: number, total: number): AppProgress {
  const weekStart = getWeekStart();
  let weeklyAnswered = progress.weeklyAnswered ?? 0;
  let weeklyCorrect = progress.weeklyCorrect ?? 0;

  if (progress.weekStartDate !== weekStart) {
    weeklyAnswered = 0;
    weeklyCorrect = 0;
  }

  return {
    ...progress,
    weekStartDate: weekStart,
    weeklyAnswered: weeklyAnswered + total,
    weeklyCorrect: weeklyCorrect + correct,
  };
}

export function updateStreak(progress: AppProgress): AppProgress {
  const today = formatLocalDate();
  const last = progress.lastPlayedDate;

  if (!last) {
    return { ...progress, streak: 1, lastPlayedDate: today };
  }

  if (last === today) return progress;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  const streak = last === yesterdayStr ? progress.streak + 1 : 1;
  return { ...progress, streak, lastPlayedDate: today };
}

function awardBadges(progress: AppProgress, topicId: TopicId, sessionStars: 0 | 1 | 2 | 3): string[] {
  const badges = new Set(progress.badges);
  const totalAnswered = Object.values(progress.topics).reduce(
    (sum, t) => sum + (t?.totalAnswered ?? 0),
    0,
  );
  const totalStars = Object.values(progress.topics).reduce(
    (sum, t) => sum + (t?.stars ?? 0),
    0,
  );

  if (totalStars > 0) badges.add('first_star');
  if (totalAnswered >= 10) badges.add('ten_questions');
  if (totalAnswered >= 50) badges.add('fifty_questions');
  if (sessionStars === 3) badges.add('perfect_score');
  if (progress.streak >= 3) badges.add('streak_3');
  if (progress.streak >= 10) badges.add('streak_10');
  if (topicId === 'multiplication' && getTopicProgress(progress, 'multiplication').stars >= 2) {
    badges.add('multiplication_master');
  }
  if (topicId === 'fractions' && getTopicProgress(progress, 'fractions').stars >= 1) {
    badges.add('fraction_friend');
  }

  return Array.from(badges);
}

interface TopicScore {
  topicId: TopicId;
  score: number;
}

function scoreTopicForRecommendation(
  progress: AppProgress,
  topicId: TopicId,
  pathIndex: number,
): number {
  const unit = getPracticeUnit(progress.gradeLevel, topicId);
  const tp = getTopicProgress(progress, topicId);
  const roleWeight = unit?.role === 'core' ? 0 : unit?.role === 'review' ? 50 : 80;
  let score = pathIndex * 10 + roleWeight;

  if (tp.totalAnswered === 0 && unit?.role === 'core') {
    return score - 500;
  }

  score += tp.stars * 20;

  if (tp.lastPlayed) {
    const daysSince = Date.now() - new Date(tp.lastPlayed).getTime();
    if (daysSince > REVIEW_DAYS_MS && unit?.role === 'core') {
      score -= 100;
    }
  }

  if (tp.totalAnswered >= 10) {
    const accuracy = tp.totalCorrect / tp.totalAnswered;
    if (accuracy < 0.6) {
      score -= 80;
    }
  }

  return score;
}

export function getRecommendedTopic(progress: AppProgress): TopicId {
  const steps = getNextPracticeSteps(progress, 1);
  return steps[0]?.topicId ?? getTopicIdsForGrade(progress.gradeLevel)[0] ?? 'counting';
}

export interface PracticeStep {
  topicId: TopicId;
  role: 'core' | 'review' | 'stretch';
  labModeId?: LabModeId;
}

export function getNextPracticeSteps(progress: AppProgress, limit = 3): PracticeStep[] {
  const path = getPracticePath(progress.gradeLevel);
  const scored: TopicScore[] = path.map((unit, index) => ({
    topicId: unit.topicId,
    score: scoreTopicForRecommendation(progress, unit.topicId, index),
  }));

  scored.sort((a, b) => a.score - b.score);

  return scored.slice(0, limit).map(({ topicId }) => {
    const unit = getPracticeUnit(progress.gradeLevel, topicId)!;
    return {
      topicId,
      role: unit.role,
      labModeId: unit.labModeId,
    };
  });
}

export function getVictoryEncouragement(correct: number, total: number): 'perfect' | 'great' | 'good' | 'try' {
  const pct = total > 0 ? correct / total : 0;
  if (pct >= 1) return 'perfect';
  if (pct >= 0.8) return 'great';
  if (pct >= 0.6) return 'good';
  return 'try';
}

export function getLabModeProgress(progress: AppProgress, modeId: LabModeId): LabModeProgress {
  return (
    progress.labModes[modeId] ?? {
      stars: 0,
      sessionsCompleted: 0,
      bestAccuracy: 0,
    }
  );
}

function awardLabBadges(progress: AppProgress, modeId: LabModeId, sessionStars: 0 | 1 | 2 | 3): string[] {
  const badges = new Set(progress.badges);
  const labCount = Object.keys(progress.labModes).length;
  if (labCount >= 6) badges.add('lab_explorer');
  if (sessionStars === 3) badges.add('lab_perfect');
  const sessions = getLabModeProgress(progress, modeId).sessionsCompleted;
  if (sessions >= 3) badges.add('lab_streak_3');
  return Array.from(badges);
}

export function recordLabSession(
  progress: AppProgress,
  modeId: LabModeId,
  correct: number,
  total: number,
): AppProgress {
  const meta = getLabModeMeta(modeId);
  const topicId = meta.topicForProgress;
  const existingLab = getLabModeProgress(progress, modeId);
  const sessionStars = starsFromAccuracy(correct, total);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  let updated = recordSession(progress, topicId, correct, total);
  updated = {
    ...updated,
    labModes: {
      ...updated.labModes,
      [modeId]: {
        stars: Math.max(existingLab.stars, sessionStars) as 0 | 1 | 2 | 3,
        sessionsCompleted: existingLab.sessionsCompleted + 1,
        bestAccuracy: Math.max(existingLab.bestAccuracy, accuracy),
      },
    },
    badges: awardLabBadges(
      {
        ...updated,
        labModes: {
          ...updated.labModes,
          [modeId]: {
            stars: Math.max(existingLab.stars, sessionStars) as 0 | 1 | 2 | 3,
            sessionsCompleted: existingLab.sessionsCompleted + 1,
            bestAccuracy: Math.max(existingLab.bestAccuracy, accuracy),
          },
        },
      },
      modeId,
      sessionStars,
    ),
  };

  saveProgress(updated);
  return updated;
}

export interface RecordSessionOptions {
  peakDifficulty?: 1 | 2 | 3;
}

export function recordSession(
  progress: AppProgress,
  topicId: TopicId,
  correct: number,
  total: number,
  options?: RecordSessionOptions,
): AppProgress {
  const existing = getTopicProgress(progress, topicId);
  const sessionStars = starsFromAccuracy(correct, total);
  const newStars = Math.max(existing.stars, sessionStars) as 0 | 1 | 2 | 3;
  const sessionPct = total > 0 ? correct / total : 0;
  const peakDifficulty = options?.peakDifficulty ?? existing.savedDifficulty ?? 1;
  const perfectSessions = (existing.perfectSessions ?? 0) + (sessionPct >= 1 ? 1 : 0);
  const sessionsAt80 = (existing.sessionsAt80 ?? 0) + (sessionPct >= 0.8 ? 1 : 0);
  const masteryLevel = computeMasteryLevel(
    existing.masteryLevel ?? 0,
    sessionPct,
    perfectSessions,
    sessionsAt80,
    peakDifficulty,
  );
  const savedDifficulty = Math.max(
    existing.savedDifficulty ?? 1,
    peakDifficulty,
  ) as 1 | 2 | 3;

  let updated: AppProgress = {
    ...progress,
    topics: {
      ...progress.topics,
      [topicId]: {
        stars: newStars,
        totalAnswered: existing.totalAnswered + total,
        totalCorrect: existing.totalCorrect + correct,
        lastPlayed: new Date().toISOString(),
        masteryLevel,
        savedDifficulty,
        perfectSessions,
        sessionsAt80,
      },
    },
  };

  updated = updateWeeklyStats(updated, correct, total);
  updated = updateStreak(updated);
  updated = {
    ...updated,
    badges: awardBadges(updated, topicId, sessionStars),
  };

  saveProgress(updated);
  return updated;
}

export function setGradeLevel(progress: AppProgress, gradeLevel: GradeLevel): AppProgress {
  const updated = { ...progress, gradeLevel };
  saveProgress(updated);
  return updated;
}

export function sanitizeStudentName(raw: string): string {
  return raw.trim().replace(/[<>]/g, '').slice(0, 24);
}

export function setStudentName(progress: AppProgress, studentName: string): AppProgress {
  const updated = { ...progress, studentName: sanitizeStudentName(studentName) };
  saveProgress(updated);
  return updated;
}

export function updateSettings(
  progress: AppProgress,
  settings: Partial<AppSettings>,
): AppProgress {
  const updated = {
    ...progress,
    settings: { ...progress.settings, ...settings },
  };
  saveProgress(updated);
  return updated;
}

export function resetProgress(): AppProgress {
  const fresh = createDefaultProgress();
  saveProgress(fresh);
  return fresh;
}

export function getAccuracy(topic: TopicProgress): number {
  if (topic.totalAnswered === 0) return 0;
  return Math.round((topic.totalCorrect / topic.totalAnswered) * 100);
}

export function completeOnboarding(progress: AppProgress): AppProgress {
  return updateSettings(progress, { onboardingDone: true });
}

import type { AppProgress, GradeLevel, TopicId } from '../types';
import { EXAM_PASS_THRESHOLD } from './examConfig';
import {
  getTopicProgress,
  saveProgress,
  starsFromAccuracy,
  updateStreak,
  updateWeeklyStats,
} from '../progress';

export interface FinalExamProgress {
  attempts: number;
  bestCorrect: number;
  bestTotal: number;
  bestStars: 0 | 1 | 2 | 3;
  lastAttempt?: string;
  passed: boolean;
}

export interface TopicExamResult {
  topicId: TopicId;
  correct: number;
  total: number;
}

export function getFinalExamProgress(
  progress: AppProgress,
  grade: GradeLevel,
): FinalExamProgress | undefined {
  return progress.finalExams?.[grade];
}

function applyTopicExamCredit(
  progress: AppProgress,
  topicResults: TopicExamResult[],
): AppProgress {
  let updated = { ...progress, topics: { ...progress.topics } };

  for (const { topicId, correct, total } of topicResults) {
    if (total === 0) continue;
    const existing = getTopicProgress(updated, topicId);
    updated = {
      ...updated,
      topics: {
        ...updated.topics,
        [topicId]: {
          ...existing,
          totalAnswered: existing.totalAnswered + total,
          totalCorrect: existing.totalCorrect + correct,
          lastPlayed: new Date().toISOString(),
        },
      },
    };
  }

  return updated;
}

function awardExamBadges(
  progress: AppProgress,
  sessionStars: 0 | 1 | 2 | 3,
): string[] {
  const badges = new Set(progress.badges);
  if (sessionStars >= 2) {
    badges.add('exam_graduate');
  }
  return Array.from(badges);
}

export function recordFinalExam(
  progress: AppProgress,
  grade: GradeLevel,
  correct: number,
  total: number,
  topicResults: TopicExamResult[],
): AppProgress {
  const sessionStars = starsFromAccuracy(correct, total);
  const existing = getFinalExamProgress(progress, grade);
  const passed = total > 0 && correct / total >= EXAM_PASS_THRESHOLD;

  const examRecord: FinalExamProgress = {
    attempts: (existing?.attempts ?? 0) + 1,
    bestCorrect: Math.max(existing?.bestCorrect ?? 0, correct),
    bestTotal: total,
    bestStars: Math.max(existing?.bestStars ?? 0, sessionStars) as 0 | 1 | 2 | 3,
    lastAttempt: new Date().toISOString(),
    passed: (existing?.passed ?? false) || passed,
  };

  let updated: AppProgress = {
    ...progress,
    finalExams: {
      ...progress.finalExams,
      [grade]: examRecord,
    },
  };

  updated = applyTopicExamCredit(updated, topicResults);
  updated = updateWeeklyStats(updated, correct, total);
  updated = updateStreak(updated);
  updated = {
    ...updated,
    badges: sessionStars >= 2 ? awardExamBadges(updated, sessionStars) : updated.badges,
  };

  saveProgress(updated);
  return updated;
}

export function aggregateTopicResults(
  answers: { topicId: TopicId; correct: boolean }[],
): TopicExamResult[] {
  const map = new Map<TopicId, { correct: number; total: number }>();
  for (const { topicId, correct } of answers) {
    const entry = map.get(topicId) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (correct) entry.correct += 1;
    map.set(topicId, entry);
  }
  return Array.from(map.entries()).map(([topicId, stats]) => ({
    topicId,
    correct: stats.correct,
    total: stats.total,
  }));
}

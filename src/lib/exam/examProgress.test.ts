import { describe, expect, it, beforeEach } from 'vitest';
import { createDefaultProgress, starsFromAccuracy } from '../progress';
import { aggregateTopicResults, getFinalExamProgress, recordFinalExam } from './examProgress';

beforeEach(() => {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    key: () => null,
    length: 0,
  } as Storage;
});

describe('recordFinalExam', () => {
  it('saves exam stats per grade', () => {
    const progress = createDefaultProgress('grade2');
    const updated = recordFinalExam(progress, 'grade2', 12, 15, [
      { topicId: 'addSub100', correct: 4, total: 5 },
      { topicId: 'placeValue', correct: 3, total: 5 },
    ]);

    const exam = getFinalExamProgress(updated, 'grade2');
    expect(exam?.attempts).toBe(1);
    expect(exam?.bestCorrect).toBe(12);
    expect(exam?.bestStars).toBe(starsFromAccuracy(12, 15));
    expect(exam?.passed).toBe(true);
  });

  it('awards exam_graduate badge at 80%+', () => {
    const progress = createDefaultProgress('k1');
    const updated = recordFinalExam(progress, 'k1', 12, 15, []);
    expect(updated.badges).toContain('exam_graduate');
  });

  it('adds topic answered counts without inflating stars', () => {
    const progress = createDefaultProgress('k1');
    const updated = recordFinalExam(progress, 'k1', 8, 15, [
      { topicId: 'counting', correct: 3, total: 3 },
    ]);
    expect(updated.topics.counting?.totalAnswered).toBe(3);
    expect(updated.topics.counting?.totalCorrect).toBe(3);
    expect(updated.topics.counting?.stars).toBe(0);
  });
});

describe('aggregateTopicResults', () => {
  it('groups answers by topic', () => {
    const results = aggregateTopicResults([
      { topicId: 'counting', correct: true },
      { topicId: 'counting', correct: false },
      { topicId: 'shapes', correct: true },
    ]);
    expect(results).toEqual([
      { topicId: 'counting', correct: 1, total: 2 },
      { topicId: 'shapes', correct: 1, total: 1 },
    ]);
  });
});

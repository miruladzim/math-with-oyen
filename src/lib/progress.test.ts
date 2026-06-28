import { describe, expect, it } from 'vitest';
import {
  createDefaultProgress,
  getNextPracticeSteps,
  getRecommendedTopic,
  getVictoryEncouragement,
  getWeekStart,
  starsFromAccuracy,
} from './progress';

describe('starsFromAccuracy', () => {
  it('returns 3 stars for perfect score', () => {
    expect(starsFromAccuracy(10, 10)).toBe(3);
  });

  it('returns 2 stars for 80%+', () => {
    expect(starsFromAccuracy(8, 10)).toBe(2);
  });

  it('returns 0 stars below 60%', () => {
    expect(starsFromAccuracy(3, 10)).toBe(0);
  });
});

describe('getVictoryEncouragement', () => {
  it('returns perfect for 100%', () => {
    expect(getVictoryEncouragement(8, 8)).toBe('perfect');
  });

  it('returns try for low scores', () => {
    expect(getVictoryEncouragement(2, 8)).toBe('try');
  });
});

describe('getRecommendedTopic', () => {
  it('picks first core topic when all empty', () => {
    const progress = createDefaultProgress('k1');
    expect(getRecommendedTopic(progress)).toBe('counting');
  });
});

describe('getNextPracticeSteps', () => {
  it('returns up to 3 steps for the grade path', () => {
    const progress = createDefaultProgress('grade2');
    const steps = getNextPracticeSteps(progress, 3);
    expect(steps.length).toBe(3);
    expect(steps[0].topicId).toBe('addSub100');
  });
});

describe('getWeekStart', () => {
  it('returns an ISO date string', () => {
    expect(getWeekStart()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

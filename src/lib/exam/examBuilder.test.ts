import { describe, expect, it } from 'vitest';
import { EXAM_TOTAL_QUESTIONS } from './examConfig';

describe('buildFinalExam', () => {
  it('builds k1 exam with 15 choice questions', async () => {
    const { buildFinalExam } = await import('./examBuilder');
    const paper = buildFinalExam('k1', 'en');
    expect(paper.questions).toHaveLength(EXAM_TOTAL_QUESTIONS);
    paper.questions.forEach((q) => {
      expect(q.inputType).toBe('choice');
      expect(q.choices?.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('builds grade45 exam without hanging', async () => {
    const { buildFinalExam } = await import('./examBuilder');
    const paper = buildFinalExam('grade45', 'en');
    expect(paper.questions).toHaveLength(EXAM_TOTAL_QUESTIONS);
  });
});

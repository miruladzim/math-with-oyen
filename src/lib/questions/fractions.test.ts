import { describe, expect, it } from 'vitest';
import { generateFractionQuestion } from './fractions';

describe('generateFractionQuestion', () => {
  it('always produces four choices without hanging at difficulty 1', () => {
    for (let i = 0; i < 40; i++) {
      const question = generateFractionQuestion(1, 'en');
      expect(question.inputType).toBe('choice');
      expect(question.choices?.length).toBe(4);
      expect(question.choices).toContain(question.correctAnswer);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { EXAM_TOTAL_QUESTIONS, QUESTIONS_PER_SECTION } from './examConfig';
import { buildFinalExam } from './examBuilder';

describe('buildFinalExam', () => {
  it('builds k1 exam with 15 choice questions', () => {
    const paper = buildFinalExam('k1', 'en');
    expect(paper.questions).toHaveLength(EXAM_TOTAL_QUESTIONS);
    paper.questions.forEach((q) => {
      expect(q.inputType).toBe('choice');
      expect(q.choices?.length).toBeGreaterThanOrEqual(4);
      expect(q.examKind).toMatch(/^(skill|story|kbat)$/);
    });
  });

  it('includes cerita and KBAT in every section', () => {
    const paper = buildFinalExam('grade2', 'ms');
    for (const section of paper.sections) {
      expect(section.questions).toHaveLength(QUESTIONS_PER_SECTION);
      expect(section.questions.some((q) => q.examKind === 'story')).toBe(true);
      expect(section.questions.some((q) => q.examKind === 'kbat')).toBe(true);
      expect(section.questions.filter((q) => q.examKind === 'skill')).toHaveLength(3);
    }
  });

  it('builds grade45 exam with story prompts in Malay', () => {
    const paper = buildFinalExam('grade45', 'ms');
    expect(paper.questions).toHaveLength(EXAM_TOTAL_QUESTIONS);
    const stories = paper.questions.filter((q) => q.examKind === 'story');
    expect(stories.length).toBe(3);
    expect(stories.some((q) => q.prompt.includes(' ') && q.prompt.length > 12)).toBe(true);
  });

  it('fills story and word-problem placeholders in prompts', () => {
    const paper = buildFinalExam('grade2', 'en');
    const placeholder = /\{(?:name|name1|name2|item|a|b|c|target|total|groups|bags|n|product|f1|f2)\}/;
    for (const question of paper.questions) {
      expect(question.prompt).not.toMatch(placeholder);
    }
  });

  it('builds preschool practice path topics', () => {
    const paper = buildFinalExam('k1', 'en');
    expect(paper.questions.length).toBe(EXAM_TOTAL_QUESTIONS);
  });
});

describe('ensureChoiceQuestion', () => {
  it('builds grade45 exam without hanging', async () => {
    const { buildFinalExam: build } = await import('./examBuilder');
    const paper = build('grade45', 'en');
    expect(paper.questions).toHaveLength(EXAM_TOTAL_QUESTIONS);
  });
});

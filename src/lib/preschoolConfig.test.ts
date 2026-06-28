import { describe, expect, it } from 'vitest';
import { getPracticePath } from './curriculum/practicePath';
import { getLabModesForGrade } from './lab/labConfig';
import { buildTapGardenChallenge, buildCompareCoveChallenge, buildStoryWalkChallenge, buildNumberTraceChallenge } from './lab/challenges';
import { FORBIDDEN_EMOJI } from './kidFriendlyEmojis';
import { getGamesForGrade, getPracticeSessionSize, getPreschoolGameTopic } from './preschoolConfig';

describe('preschool curriculum', () => {
  it('defines a play-based practice path', () => {
    const path = getPracticePath('preschool');
    expect(path.map((u) => u.topicId)).toEqual(['counting', 'shapes', 'compare', 'patterns']);
  });

  it('exposes preschool lab modes including tap garden', () => {
    const modes = getLabModesForGrade('preschool').map((m) => m.id);
    expect(modes).toContain('tapGarden');
    expect(modes).toContain('compareCove');
    expect(modes).toContain('numberTrace');
    expect(modes).toContain('shapeMatch');
    expect(modes).toContain('storyWalk');
    expect(modes).toContain('puzzlePatch');
    expect(modes).toContain('patternStudio');
    expect(modes).toContain('sortSquad');
  });

  it('limits session and game counts for young learners', () => {
    expect(getPracticeSessionSize('preschool')).toBe(5);
    expect(getGamesForGrade('preschool')).toEqual(['dive', 'match', 'balloon']);
    expect(getPreschoolGameTopic('dive')).toBe('counting');
    expect(getPreschoolGameTopic('match')).toBe('shapes');
    expect(getPreschoolGameTopic('balloon')).toBe('counting');
  });

  it('links preschool practice topics to new lab modes', () => {
    const path = getPracticePath('preschool');
    expect(path.find((u) => u.topicId === 'counting')?.labModeId).toBe('numberTrace');
    expect(path.find((u) => u.topicId === 'compare')?.labModeId).toBe('compareCove');
  });

  it('builds tap garden challenges without placeholders', () => {
    const challenge = buildTapGardenChallenge(1, 'en', 0);
    expect(challenge.items.length).toBe(challenge.correctCount);
    expect(challenge.choices).toContain(challenge.correctCount);
    expect(challenge.prompt).not.toMatch(/\{/);
  });

  it('builds compare cove, story walk, and number trace challenges', () => {
    const compare = buildCompareCoveChallenge(1, 'en', 0);
    expect(compare.groupA).not.toBe(compare.groupB);
    for (const emoji of FORBIDDEN_EMOJI) {
      expect(compare.emoji).not.toBe(emoji);
    }

    const story = buildStoryWalkChallenge(1, 'en', 0);
    expect(story.beats).toHaveLength(5);
    expect(story.beats[0].choices).toContain(story.beats[0].correctCount);

    const trace = buildNumberTraceChallenge(1, 'en', 2);
    expect(trace.digit).toBeGreaterThanOrEqual(1);
    expect(trace.digit).toBeLessThanOrEqual(5);
  });
});

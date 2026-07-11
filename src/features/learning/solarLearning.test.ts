import { describe, expect, it } from 'vitest';
import {
  getLearningTopicsForBody,
  getPrerequisitesForTopic,
  getRecommendedNextTopics,
} from './solarLearning';

describe('solar learning taxonomy', () => {
  it('maps Earth to the spin-and-orbit lesson with its age band and observation prompt', () => {
    const topics = getLearningTopicsForBody('earth');
    const spinAndOrbit = topics.find((topic) => topic.id === 'earth-spin-orbit');

    expect(spinAndOrbit).toMatchObject({
      title: '地球的自轉與公轉',
      ageRange: '7–9 歲',
      observation: expect.stringContaining('365'),
    });
  });

  it('returns Marble-sourced prerequisite concepts for the Moon orbit lesson', () => {
    expect(getPrerequisitesForTopic('moon-orbit')).toEqual(['觀察月相', '地球的自轉與公轉']);
  });

  it('recommends only unfinished follow-up lessons', () => {
    expect(getRecommendedNextTopics('earth-spin-orbit', new Set(['moon-orbit']))).toEqual([
      '為什麼季節改變',
    ]);
  });
});

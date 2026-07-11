import { describe, expect, it } from 'vitest';
import { renderLearningPanel } from './learningPanel';

describe('renderLearningPanel', () => {
  it('renders the selected lesson with observation, prerequisites, completion state, and attribution', () => {
    const html = renderLearningPanel('earth', new Set(['earth-spin-orbit']));

    expect(html).toContain('地球的自轉與公轉');
    expect(html).toContain('你正在看見');
    expect(html).toContain('太陽是一顆恆星');
    expect(html).toContain('已理解');
    expect(html).toContain('Marble Skill Taxonomy');
  });

  it('returns a useful learning prompt when the selected body has no mapping', () => {
    expect(renderLearningPanel('unknown', new Set())).toContain('尚未策展對應的學習主題');
  });
});

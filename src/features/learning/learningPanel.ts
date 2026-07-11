import {
  getLearningTopicsForBody,
  getPrerequisitesForTopic,
  getRecommendedNextTopics,
  MARBLE_ATTRIBUTION,
} from './solarLearning';

export function renderLearningPanel(bodyId: string, completed: ReadonlySet<string>): string {
  const topics = getLearningTopicsForBody(bodyId);
  if (topics.length === 0) {
    return `<section class="learning" aria-label="學習探索"><p class="muted">此天體尚未策展對應的學習主題。</p></section>`;
  }

  return `<section class="learning" aria-label="學習探索">
    <div class="learning__eyebrow">學習探索 · Marble Skill Taxonomy</div>
    ${topics
      .map((topic) => {
        const prerequisites = getPrerequisitesForTopic(topic.id);
        const next = getRecommendedNextTopics(topic.id, completed);
        const isComplete = completed.has(topic.id);
        return `<article class="learning__topic">
          <div class="learning__heading">
            <h2>${topic.title}</h2><span class="learning__age">${topic.ageRange}</span>
          </div>
          <p>${topic.description}</p>
          <div class="learning__observe"><strong>你正在看見：</strong>${topic.observation}</div>
          <details class="learning__details">
            <summary>理解檢核（${topic.evidence.length} 項）</summary>
            <ul>${topic.evidence.map((item) => `<li>${item}</li>`).join('')}</ul>
          </details>
          ${
            prerequisites.length > 0
              ? `<p class="learning__path"><strong>先理解：</strong>${prerequisites.join(' → ')}</p>`
              : '<p class="learning__path"><strong>先理解：</strong>這是此導覽的起點。</p>'
          }
          ${next.length > 0 ? `<p class="learning__path"><strong>下一步：</strong>${next.join('、')}</p>` : ''}
          <button class="btn learning__complete" type="button" data-learning-complete="${topic.id}" aria-pressed="${isComplete}">${isComplete ? '已理解' : '標記為已理解'}</button>
        </article>`;
      })
      .join('')}
    <p class="learning__attribution">資料來源：${MARBLE_ATTRIBUTION}</p>
  </section>`;
}

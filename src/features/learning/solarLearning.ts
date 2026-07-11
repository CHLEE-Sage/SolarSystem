export type LearningTopic = {
  id: string;
  marbleId: string;
  title: string;
  ageRange: string;
  description: string;
  observation: string;
  evidence: string[];
  prerequisites: string[];
  next: string[];
};

/**
 * A small, hand-curated derivative of Marble Skill Taxonomy v1 for this scene.
 * Source taxonomy IDs remain stable so this map can be regenerated from upstream.
 */
const TOPICS: Record<string, LearningTopic> = {
  'sun-moon-stars': {
    id: 'sun-moon-stars',
    marbleId: 'mt_PiWZA8Z0ZJ',
    title: '太陽、月球與星星',
    ageRange: '5–7 歲',
    description: '認識太陽、月球和星星都是天空中的天體，並比較它們看起來的不同。',
    observation: '聚焦太陽後，再選擇月球；比較它們的大小、位置與是否自行發光。',
    evidence: ['能指出太陽、月球與星星都是天體', '能說出太陽會發光，而月球看見的是反射光'],
    prerequisites: [],
    next: ['our-solar-system', 'sun-is-a-star', 'moon-phases'],
  },
  'sun-is-a-star': {
    id: 'sun-is-a-star',
    marbleId: 'mt_u3Y3Tb-G_n',
    title: '太陽是一顆恆星',
    ageRange: '7–9 歲',
    description: '了解太陽是離地球最近的恆星，會提供光與熱。',
    observation: '選擇太陽，觀察它位於所有行星軌道的中心。',
    evidence: ['能說出太陽是恆星，不是行星', '能連結太陽與地球得到的光和熱'],
    prerequisites: ['sun-moon-stars'],
    next: ['earth-spin-orbit'],
  },
  'our-solar-system': {
    id: 'our-solar-system',
    marbleId: 'mt_XlyF294bPR',
    title: '我們的太陽系',
    ageRange: '5–7 歲',
    description: '知道地球之外還有其他行星；圍繞太陽運行的天體群叫太陽系。',
    observation: '重設為全景，從內到外依序選擇八顆行星，找出它們共同繞行的中心。',
    evidence: ['能說出地球是行星，太陽系中還有其他行星', '能用「太陽系」描述太陽與繞行它的行星'],
    prerequisites: ['sun-moon-stars'],
    next: ['earth-spin-orbit', 'eight-planets'],
  },
  'eight-planets': {
    id: 'eight-planets',
    marbleId: 'mt_AVk2EmSULC',
    title: '八大行星',
    ageRange: '7–9 歲',
    description: '辨認太陽系的八大行星，並按由太陽向外的順序探索它們。',
    observation: '使用「聚焦天體」選單，依水星到海王星的順序巡覽。',
    evidence: ['能辨認太陽系有八大行星', '能說出行星由太陽向外的大致順序'],
    prerequisites: ['our-solar-system'],
    next: ['solar-system-scale'],
  },
  'earth-spin-orbit': {
    id: 'earth-spin-orbit',
    marbleId: 'mt_w2xiMNkyyX',
    title: '地球的自轉與公轉',
    ageRange: '7–9 歲',
    description: '地球約每 24 小時自轉一圈形成日夜，約每 365 天繞太陽公轉一圈形成一年。',
    observation: '選擇地球，將時間加速；觀察地球沿軌道持續繞太陽移動約 365 天為一圈。',
    evidence: [
      '能示範自轉讓朝向太陽的一側是白天、背向的一側是黑夜',
      '能說出自轉約 24 小時、公轉約 365 天',
    ],
    prerequisites: ['sun-is-a-star'],
    next: ['moon-orbit', 'why-seasons-change'],
  },
  'moon-phases': {
    id: 'moon-phases',
    marbleId: 'mt_ByXgbTld6R',
    title: '觀察月相',
    ageRange: '5–7 歲',
    description: '觀察月球外觀約一個月會重複變化：新月、半月、滿月，再回到新月。',
    observation: '選擇月球並加速時間；注意它繞地球的週期約為一個月。',
    evidence: ['能描述月球看起來會改變形狀', '能畫出或說出新月、半月、滿月至少三種月相'],
    prerequisites: ['sun-moon-stars'],
    next: ['moon-orbit'],
  },
  'moon-orbit': {
    id: 'moon-orbit',
    marbleId: 'mt_15FduGRf5c',
    title: '月球的軌道與月相',
    ageRange: '7–9 歲',
    description: '月球約每 28–30 天繞地球一圈；它反射太陽光，不同月相來自我們看見的受光面不同。',
    observation: '先聚焦地球，再聚焦月球；用時間加速觀察月球繞地球的較短週期。',
    evidence: [
      '能說出月球約一個月繞地球一圈',
      '能解釋月球反射太陽光',
      '能描述月相與月球繞地球位置有關',
    ],
    prerequisites: ['moon-phases', 'earth-spin-orbit'],
    next: [],
  },
  'why-seasons-change': {
    id: 'why-seasons-change',
    marbleId: 'mt_K0mZxY2AM8',
    title: '為什麼季節改變',
    ageRange: '5–7 歲',
    description: '透過一年中日照長短的觀察，發現夏天白晝較長、冬天白晝較短。',
    observation: '選擇地球，觀察它繞太陽運行；此展示只呈現運動，季節成因還需搭配地軸傾角模型。',
    evidence: ['能描述夏季白晝較長、冬季白晝較短', '能比較一年不同時間的日出與日落'],
    prerequisites: ['earth-spin-orbit'],
    next: [],
  },
  'solar-system-scale': {
    id: 'solar-system-scale',
    marbleId: 'mt_TlGhXAqC4p',
    title: '太陽系的尺度',
    ageRange: '9–11 歲',
    description: '比較行星間距與行星大小，理解太陽系中距離非常龐大。',
    observation: '在「尺度模式」切換到「接近真實 AU 距離」，比較外行星的間距變化。',
    evidence: ['能說明模型為了方便觀察會壓縮距離或放大行星', '能比較內、外行星的相對距離'],
    prerequisites: ['eight-planets'],
    next: [],
  },
};

const BODY_TOPICS: Record<string, string[]> = {
  sun: ['sun-moon-stars', 'sun-is-a-star', 'our-solar-system'],
  mercury: ['our-solar-system', 'eight-planets'],
  venus: ['our-solar-system', 'eight-planets'],
  earth: ['our-solar-system', 'earth-spin-orbit', 'why-seasons-change'],
  moon: ['moon-phases', 'moon-orbit'],
  mars: ['our-solar-system', 'eight-planets'],
  jupiter: ['our-solar-system', 'eight-planets', 'solar-system-scale'],
  saturn: ['our-solar-system', 'eight-planets', 'solar-system-scale'],
  uranus: ['our-solar-system', 'eight-planets', 'solar-system-scale'],
  neptune: ['our-solar-system', 'eight-planets', 'solar-system-scale'],
  'asteroid-belt': ['our-solar-system', 'solar-system-scale'],
};

export const MARBLE_ATTRIBUTION =
  'Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · https://withmarble.com · ODbL 1.0（資料庫）與 CC BY-SA 4.0（內容）';

export function getLearningTopicsForBody(bodyId: string): LearningTopic[] {
  return (BODY_TOPICS[bodyId] ?? []).map((id) => TOPICS[id]!);
}

export function getPrerequisitesForTopic(topicId: string): string[] {
  return TOPICS[topicId]?.prerequisites.map((id) => TOPICS[id]!.title) ?? [];
}

export function getRecommendedNextTopics(
  topicId: string,
  completed: ReadonlySet<string>,
): string[] {
  return (TOPICS[topicId]?.next ?? [])
    .filter((id) => !completed.has(id))
    .map((id) => TOPICS[id]!.title);
}

export function getTopic(topicId: string): LearningTopic | undefined {
  return TOPICS[topicId];
}

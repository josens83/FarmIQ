import type { LevelInfo, LevelReward } from '../../types';

export const levelThresholds: LevelInfo[] = [
  {
    level: 1,
    xpRequired: 0,
    rewards: [
      { type: 'money', value: 0, description: '시작 자금' }
    ]
  },
  {
    level: 2,
    xpRequired: 100,
    rewards: [
      { type: 'money', value: 500, description: '$500 보너스' },
      { type: 'unlock', value: 'basil', description: '바질 잠금 해제' },
      { type: 'unlock', value: 'kale', description: '케일 잠금 해제' }
    ]
  },
  {
    level: 3,
    xpRequired: 300,
    rewards: [
      { type: 'money', value: 1000, description: '$1,000 보너스' },
      { type: 'unlock', value: 'strawberry', description: '딸기 잠금 해제' },
      { type: 'unlock', value: 'cucumber', description: '오이 잠금 해제' },
      { type: 'unlock', value: 'led-panel-basic', description: 'LED 패널 잠금 해제' }
    ]
  },
  {
    level: 4,
    xpRequired: 600,
    rewards: [
      { type: 'money', value: 1500, description: '$1,500 보너스' },
      { type: 'unlock', value: 'tomato', description: '토마토 잠금 해제' },
      { type: 'unlock', value: 'auto-irrigation', description: '자동 관개 잠금 해제' },
      { type: 'unlock', value: 'advanced-heater', description: '고급 히터 잠금 해제' }
    ]
  },
  {
    level: 5,
    xpRequired: 1000,
    rewards: [
      { type: 'money', value: 2000, description: '$2,000 보너스' },
      { type: 'unlock', value: 'paprika', description: '파프리카 잠금 해제' },
      { type: 'unlock', value: 'co2-generator', description: 'CO2 발생기 잠금 해제' },
      { type: 'unlock', value: 'advanced-cooler', description: '고급 냉각기 잠금 해제' },
      { type: 'unlock', value: 'ph-controller', description: 'pH 조절기 잠금 해제' }
    ]
  },
  {
    level: 6,
    xpRequired: 1600,
    rewards: [
      { type: 'money', value: 3000, description: '$3,000 보너스' },
      { type: 'unlock', value: 'led-panel-spectrum', description: '풀스펙트럼 LED 잠금 해제' },
      { type: 'unlock', value: 'drip-irrigation', description: '점적 관개 잠금 해제' },
      { type: 'unlock', value: 'nutrient-pump', description: '양액 펌프 잠금 해제' }
    ]
  },
  {
    level: 7,
    xpRequired: 2400,
    rewards: [
      { type: 'money', value: 4000, description: '$4,000 보너스' },
      { type: 'feature', value: 'automation_v2', description: '고급 자동화 잠금 해제' }
    ]
  },
  {
    level: 8,
    xpRequired: 3400,
    rewards: [
      { type: 'money', value: 5000, description: '$5,000 보너스' },
      { type: 'feature', value: 'farm_expansion', description: '농장 확장 잠금 해제' }
    ]
  },
  {
    level: 9,
    xpRequired: 4600,
    rewards: [
      { type: 'money', value: 6000, description: '$6,000 보너스' }
    ]
  },
  {
    level: 10,
    xpRequired: 6000,
    rewards: [
      { type: 'money', value: 10000, description: '$10,000 보너스' },
      { type: 'feature', value: 'master_farmer', description: '마스터 파머 칭호' }
    ]
  }
];

export const getXpForLevel = (level: number): number => {
  const info = levelThresholds.find((l) => l.level === level);
  return info?.xpRequired ?? Infinity;
};

export const getLevelFromXp = (xp: number): number => {
  let level = 1;
  for (const threshold of levelThresholds) {
    if (xp >= threshold.xpRequired) {
      level = threshold.level;
    } else {
      break;
    }
  }
  return level;
};

export const getXpToNextLevel = (currentXp: number): number => {
  const currentLevel = getLevelFromXp(currentXp);
  const nextLevelInfo = levelThresholds.find((l) => l.level === currentLevel + 1);
  if (!nextLevelInfo) return 0;
  return nextLevelInfo.xpRequired - currentXp;
};

export const getLevelProgress = (currentXp: number): number => {
  const currentLevel = getLevelFromXp(currentXp);
  const currentLevelInfo = levelThresholds.find((l) => l.level === currentLevel);
  const nextLevelInfo = levelThresholds.find((l) => l.level === currentLevel + 1);

  if (!currentLevelInfo || !nextLevelInfo) return 100;

  const xpInLevel = currentXp - currentLevelInfo.xpRequired;
  const xpForLevel = nextLevelInfo.xpRequired - currentLevelInfo.xpRequired;

  return (xpInLevel / xpForLevel) * 100;
};

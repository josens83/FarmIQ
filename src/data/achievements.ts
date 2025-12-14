export interface Achievement {
  id: string;
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;
  icon: string;
  category: 'farming' | 'economy' | 'automation' | 'mastery' | 'special';
  requirement: AchievementRequirement;
  reward?: {
    money?: number;
    xp?: number;
    unlock?: string;
  };
  hidden?: boolean;
}

export interface AchievementRequirement {
  type: 'harvest_count' | 'harvest_crop' | 'money_earned' | 'money_total' |
        'level' | 'equipment_count' | 'automation_rules' | 'play_time' |
        'days_played' | 'quality_harvest' | 'crop_variety';
  value: number;
  cropId?: string;
}

export const achievements: Achievement[] = [
  // Farming Achievements
  {
    id: 'first-harvest',
    title: 'First Harvest',
    titleKo: '첫 수확',
    description: 'Harvest your first crop',
    descriptionKo: '첫 번째 작물을 수확하세요',
    icon: '🌱',
    category: 'farming',
    requirement: { type: 'harvest_count', value: 1 },
    reward: { xp: 50 }
  },
  {
    id: 'green-thumb',
    title: 'Green Thumb',
    titleKo: '초록 손',
    description: 'Harvest 10 crops',
    descriptionKo: '작물을 10번 수확하세요',
    icon: '👍',
    category: 'farming',
    requirement: { type: 'harvest_count', value: 10 },
    reward: { xp: 100, money: 500 }
  },
  {
    id: 'expert-farmer',
    title: 'Expert Farmer',
    titleKo: '전문 농부',
    description: 'Harvest 50 crops',
    descriptionKo: '작물을 50번 수확하세요',
    icon: '🧑‍🌾',
    category: 'farming',
    requirement: { type: 'harvest_count', value: 50 },
    reward: { xp: 500, money: 2000 }
  },
  {
    id: 'master-harvester',
    title: 'Master Harvester',
    titleKo: '수확의 달인',
    description: 'Harvest 100 crops',
    descriptionKo: '작물을 100번 수확하세요',
    icon: '🏆',
    category: 'farming',
    requirement: { type: 'harvest_count', value: 100 },
    reward: { xp: 1000, money: 5000 }
  },
  {
    id: 'lettuce-lover',
    title: 'Lettuce Lover',
    titleKo: '상추 전문가',
    description: 'Harvest 20 lettuce',
    descriptionKo: '상추를 20번 수확하세요',
    icon: '🥬',
    category: 'farming',
    requirement: { type: 'harvest_crop', value: 20, cropId: 'lettuce' },
    reward: { xp: 200 }
  },
  {
    id: 'spinach-specialist',
    title: 'Spinach Specialist',
    titleKo: '시금치 전문가',
    description: 'Harvest 20 spinach',
    descriptionKo: '시금치를 20번 수확하세요',
    icon: '🥗',
    category: 'farming',
    requirement: { type: 'harvest_crop', value: 20, cropId: 'spinach' },
    reward: { xp: 200 }
  },
  {
    id: 'variety-farmer',
    title: 'Variety Farmer',
    titleKo: '다양한 농부',
    description: 'Grow 5 different types of crops',
    descriptionKo: '5종류의 다른 작물을 재배하세요',
    icon: '🌈',
    category: 'farming',
    requirement: { type: 'crop_variety', value: 5 },
    reward: { xp: 300, money: 1000 }
  },
  {
    id: 'quality-conscious',
    title: 'Quality Conscious',
    titleKo: '품질 중시',
    description: 'Harvest 10 excellent quality crops',
    descriptionKo: '최상급 품질 작물을 10번 수확하세요',
    icon: '⭐',
    category: 'farming',
    requirement: { type: 'quality_harvest', value: 10 },
    reward: { xp: 500, money: 2000 }
  },

  // Economy Achievements
  {
    id: 'first-thousand',
    title: 'First Thousand',
    titleKo: '첫 천 달러',
    description: 'Earn $1,000 total',
    descriptionKo: '총 $1,000를 벌어보세요',
    icon: '💵',
    category: 'economy',
    requirement: { type: 'money_earned', value: 1000 },
    reward: { xp: 100 }
  },
  {
    id: 'five-figure',
    title: 'Five Figure Farmer',
    titleKo: '만 달러 농부',
    description: 'Earn $10,000 total',
    descriptionKo: '총 $10,000를 벌어보세요',
    icon: '💰',
    category: 'economy',
    requirement: { type: 'money_earned', value: 10000 },
    reward: { xp: 500, money: 1000 }
  },
  {
    id: 'wealthy-farmer',
    title: 'Wealthy Farmer',
    titleKo: '부유한 농부',
    description: 'Have $50,000 at once',
    descriptionKo: '한번에 $50,000를 보유하세요',
    icon: '🤑',
    category: 'economy',
    requirement: { type: 'money_total', value: 50000 },
    reward: { xp: 1000 }
  },

  // Automation Achievements
  {
    id: 'first-automation',
    title: 'First Automation',
    titleKo: '첫 자동화',
    description: 'Create your first automation rule',
    descriptionKo: '첫 자동화 규칙을 만드세요',
    icon: '🤖',
    category: 'automation',
    requirement: { type: 'automation_rules', value: 1 },
    reward: { xp: 100 }
  },
  {
    id: 'automation-master',
    title: 'Automation Master',
    titleKo: '자동화 마스터',
    description: 'Create 5 automation rules',
    descriptionKo: '자동화 규칙을 5개 만드세요',
    icon: '⚙️',
    category: 'automation',
    requirement: { type: 'automation_rules', value: 5 },
    reward: { xp: 500, money: 1000 }
  },
  {
    id: 'equipment-collector',
    title: 'Equipment Collector',
    titleKo: '장비 수집가',
    description: 'Own 10 pieces of equipment',
    descriptionKo: '장비를 10개 보유하세요',
    icon: '🔧',
    category: 'automation',
    requirement: { type: 'equipment_count', value: 10 },
    reward: { xp: 300 }
  },

  // Mastery Achievements
  {
    id: 'level-5',
    title: 'Apprentice Farmer',
    titleKo: '견습 농부',
    description: 'Reach level 5',
    descriptionKo: '레벨 5에 도달하세요',
    icon: '📈',
    category: 'mastery',
    requirement: { type: 'level', value: 5 },
    reward: { money: 1000 }
  },
  {
    id: 'level-10',
    title: 'Skilled Farmer',
    titleKo: '숙련된 농부',
    description: 'Reach level 10',
    descriptionKo: '레벨 10에 도달하세요',
    icon: '🎯',
    category: 'mastery',
    requirement: { type: 'level', value: 10 },
    reward: { money: 5000 }
  },
  {
    id: 'level-20',
    title: 'Master Farmer',
    titleKo: '마스터 농부',
    description: 'Reach level 20',
    descriptionKo: '레벨 20에 도달하세요',
    icon: '👑',
    category: 'mastery',
    requirement: { type: 'level', value: 20 },
    reward: { money: 10000 }
  },

  // Special Achievements
  {
    id: 'dedicated-player',
    title: 'Dedicated Player',
    titleKo: '열성 플레이어',
    description: 'Play for 1 hour',
    descriptionKo: '1시간 동안 플레이하세요',
    icon: '⏰',
    category: 'special',
    requirement: { type: 'play_time', value: 3600 },
    reward: { xp: 200 }
  },
  {
    id: 'week-survivor',
    title: 'Week Survivor',
    titleKo: '일주일 생존',
    description: 'Survive for 7 game days',
    descriptionKo: '게임에서 7일을 버티세요',
    icon: '📅',
    category: 'special',
    requirement: { type: 'days_played', value: 7 },
    reward: { xp: 300, money: 1000 }
  },
  {
    id: 'month-master',
    title: 'Month Master',
    titleKo: '한 달의 주인',
    description: 'Survive for 30 game days',
    descriptionKo: '게임에서 30일을 버티세요',
    icon: '🗓️',
    category: 'special',
    requirement: { type: 'days_played', value: 30 },
    reward: { xp: 1000, money: 5000 }
  }
];

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find(a => a.id === id);
}

export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return achievements.filter(a => a.category === category);
}

export function checkAchievementProgress(
  achievement: Achievement,
  stats: {
    totalHarvests: number;
    totalRevenue: number;
    currentMoney: number;
    level: number;
    equipmentCount: number;
    automationRulesCount: number;
    playTime: number;
    daysPlayed: number;
    cropsGrown: Record<string, number>;
    qualityHarvests: number;
  }
): { unlocked: boolean; progress: number; max: number } {
  const { requirement } = achievement;
  let current = 0;

  switch (requirement.type) {
    case 'harvest_count':
      current = stats.totalHarvests;
      break;
    case 'harvest_crop':
      current = stats.cropsGrown[requirement.cropId || ''] || 0;
      break;
    case 'money_earned':
      current = stats.totalRevenue;
      break;
    case 'money_total':
      current = stats.currentMoney;
      break;
    case 'level':
      current = stats.level;
      break;
    case 'equipment_count':
      current = stats.equipmentCount;
      break;
    case 'automation_rules':
      current = stats.automationRulesCount;
      break;
    case 'play_time':
      current = stats.playTime;
      break;
    case 'days_played':
      current = stats.daysPlayed;
      break;
    case 'quality_harvest':
      current = stats.qualityHarvests;
      break;
    case 'crop_variety':
      current = Object.keys(stats.cropsGrown).length;
      break;
  }

  return {
    unlocked: current >= requirement.value,
    progress: Math.min(current, requirement.value),
    max: requirement.value
  };
}

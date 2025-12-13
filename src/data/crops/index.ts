import type { CropDefinition, CropStage } from '../../types';

// Shared crop stages template
const createStages = (
  seedDays: number,
  sproutDays: number,
  vegetativeDays: number,
  floweringDays: number,
  harvestDays: number
): CropStage[] => [
  {
    id: 'seed',
    name: 'Seed',
    nameKo: '씨앗',
    daysRequired: seedDays,
    waterNeed: 0.5,
    nutrientNeed: 0.3
  },
  {
    id: 'sprout',
    name: 'Sprout',
    nameKo: '새싹',
    daysRequired: sproutDays,
    waterNeed: 0.8,
    nutrientNeed: 0.5
  },
  {
    id: 'vegetative',
    name: 'Vegetative',
    nameKo: '성장기',
    daysRequired: vegetativeDays,
    waterNeed: 1.0,
    nutrientNeed: 1.0
  },
  {
    id: 'flowering',
    name: 'Flowering',
    nameKo: '개화기',
    daysRequired: floweringDays,
    waterNeed: 1.2,
    nutrientNeed: 1.2
  },
  {
    id: 'harvest',
    name: 'Harvest',
    nameKo: '수확기',
    daysRequired: harvestDays,
    waterNeed: 0.8,
    nutrientNeed: 0.6
  }
];

export const cropDefinitions: Record<string, CropDefinition> = {
  lettuce: {
    id: 'lettuce',
    name: 'Lettuce',
    nameKo: '상추',
    description: 'Easy-to-grow leafy green, perfect for beginners.',
    descriptionKo: '초보자에게 완벽한 재배하기 쉬운 엽채류입니다.',
    difficulty: 1,
    growthDays: 35,
    stages: createStages(3, 5, 15, 7, 5),
    optimalConditions: {
      temperature: { min: 15, max: 24, optimal: 20 },
      humidity: { min: 50, max: 70, optimal: 60 },
      light: { min: 200, max: 500, optimal: 350 },
      ph: { min: 5.5, max: 6.5, optimal: 6.0 },
      ec: { min: 0.8, max: 1.5, optimal: 1.2 }
    },
    baseYield: 0.3,
    basePrice: 2.5,
    seedCost: 0.5,
    unlockLevel: 1,
    sprites: {
      seed: '🌱',
      sprout: '🌿',
      vegetative: '🥬',
      flowering: '🥬',
      harvest: '🥬'
    },
    category: 'leafy'
  },

  spinach: {
    id: 'spinach',
    name: 'Spinach',
    nameKo: '시금치',
    description: 'Nutritious leafy green with moderate growing requirements.',
    descriptionKo: '적당한 재배 조건이 필요한 영양가 높은 엽채류입니다.',
    difficulty: 2,
    growthDays: 45,
    stages: createStages(4, 7, 20, 8, 6),
    optimalConditions: {
      temperature: { min: 12, max: 20, optimal: 16 },
      humidity: { min: 55, max: 75, optimal: 65 },
      light: { min: 250, max: 600, optimal: 400 },
      ph: { min: 6.0, max: 7.0, optimal: 6.5 },
      ec: { min: 1.0, max: 2.0, optimal: 1.5 }
    },
    baseYield: 0.25,
    basePrice: 3.0,
    seedCost: 0.6,
    unlockLevel: 1,
    sprites: {
      seed: '🌱',
      sprout: '🌿',
      vegetative: '🥬',
      flowering: '🥬',
      harvest: '🥬'
    },
    category: 'leafy'
  },

  basil: {
    id: 'basil',
    name: 'Basil',
    nameKo: '바질',
    description: 'Aromatic herb that loves warmth and moderate humidity.',
    descriptionKo: '따뜻한 환경과 적당한 습도를 좋아하는 향기로운 허브입니다.',
    difficulty: 2,
    growthDays: 40,
    stages: createStages(5, 7, 18, 6, 4),
    optimalConditions: {
      temperature: { min: 18, max: 28, optimal: 24 },
      humidity: { min: 45, max: 65, optimal: 55 },
      light: { min: 300, max: 700, optimal: 500 },
      ph: { min: 5.5, max: 6.5, optimal: 6.0 },
      ec: { min: 0.8, max: 1.6, optimal: 1.2 }
    },
    baseYield: 0.15,
    basePrice: 8.0,
    seedCost: 1.0,
    unlockLevel: 2,
    sprites: {
      seed: '🌱',
      sprout: '🌿',
      vegetative: '🌿',
      flowering: '🌸',
      harvest: '🌿'
    },
    category: 'herb'
  },

  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    nameKo: '딸기',
    description: 'Sweet fruit requiring careful temperature and nutrient management.',
    descriptionKo: '신중한 온도와 영양분 관리가 필요한 달콤한 과일입니다.',
    difficulty: 3,
    growthDays: 75,
    stages: createStages(7, 12, 30, 16, 10),
    optimalConditions: {
      temperature: { min: 13, max: 25, optimal: 18 },
      humidity: { min: 60, max: 80, optimal: 70 },
      light: { min: 400, max: 800, optimal: 600 },
      ph: { min: 5.5, max: 6.5, optimal: 6.0 },
      ec: { min: 1.0, max: 2.0, optimal: 1.4 }
    },
    baseYield: 0.4,
    basePrice: 12.0,
    seedCost: 3.0,
    unlockLevel: 3,
    sprites: {
      seed: '🌱',
      sprout: '🌿',
      vegetative: '🍃',
      flowering: '🌸',
      harvest: '🍓'
    },
    category: 'fruit'
  },

  tomato: {
    id: 'tomato',
    name: 'Tomato',
    nameKo: '토마토',
    description: 'Classic vegetable needing precise environmental control.',
    descriptionKo: '정밀한 환경 제어가 필요한 클래식한 채소입니다.',
    difficulty: 4,
    growthDays: 80,
    stages: createStages(8, 14, 35, 15, 8),
    optimalConditions: {
      temperature: { min: 18, max: 27, optimal: 24 },
      humidity: { min: 55, max: 75, optimal: 65 },
      light: { min: 500, max: 1000, optimal: 700 },
      ph: { min: 5.8, max: 6.8, optimal: 6.3 },
      ec: { min: 2.0, max: 3.5, optimal: 2.5 }
    },
    baseYield: 2.5,
    basePrice: 5.0,
    seedCost: 2.0,
    unlockLevel: 4,
    sprites: {
      seed: '🌱',
      sprout: '🌿',
      vegetative: '🍃',
      flowering: '🌼',
      harvest: '🍅'
    },
    category: 'fruit'
  },

  paprika: {
    id: 'paprika',
    name: 'Paprika',
    nameKo: '파프리카',
    description: 'Challenging crop for experienced farmers with high reward.',
    descriptionKo: '높은 보상을 가진 숙련된 농부를 위한 도전적인 작물입니다.',
    difficulty: 5,
    growthDays: 100,
    stages: createStages(10, 18, 42, 20, 10),
    optimalConditions: {
      temperature: { min: 20, max: 28, optimal: 25 },
      humidity: { min: 55, max: 70, optimal: 62 },
      light: { min: 600, max: 1200, optimal: 850 },
      ph: { min: 5.8, max: 6.5, optimal: 6.2 },
      ec: { min: 2.0, max: 3.0, optimal: 2.4 }
    },
    baseYield: 1.8,
    basePrice: 8.0,
    seedCost: 3.5,
    unlockLevel: 5,
    sprites: {
      seed: '🌱',
      sprout: '🌿',
      vegetative: '🍃',
      flowering: '🌸',
      harvest: '🫑'
    },
    category: 'fruit'
  },

  cucumber: {
    id: 'cucumber',
    name: 'Cucumber',
    nameKo: '오이',
    description: 'Fast-growing vegetable that thrives in warm, humid conditions.',
    descriptionKo: '따뜻하고 습한 환경에서 잘 자라는 빠르게 성장하는 채소입니다.',
    difficulty: 3,
    growthDays: 55,
    stages: createStages(5, 10, 25, 10, 5),
    optimalConditions: {
      temperature: { min: 20, max: 30, optimal: 26 },
      humidity: { min: 65, max: 85, optimal: 75 },
      light: { min: 400, max: 800, optimal: 600 },
      ph: { min: 5.5, max: 6.8, optimal: 6.0 },
      ec: { min: 1.5, max: 2.5, optimal: 2.0 }
    },
    baseYield: 1.5,
    basePrice: 3.5,
    seedCost: 1.5,
    unlockLevel: 3,
    sprites: {
      seed: '🌱',
      sprout: '🌿',
      vegetative: '🍃',
      flowering: '🌼',
      harvest: '🥒'
    },
    category: 'fruit'
  },

  kale: {
    id: 'kale',
    name: 'Kale',
    nameKo: '케일',
    description: 'Hardy leafy green that tolerates cooler temperatures.',
    descriptionKo: '서늘한 온도를 견디는 튼튼한 엽채류입니다.',
    difficulty: 2,
    growthDays: 50,
    stages: createStages(5, 8, 22, 10, 5),
    optimalConditions: {
      temperature: { min: 10, max: 22, optimal: 16 },
      humidity: { min: 50, max: 70, optimal: 60 },
      light: { min: 300, max: 600, optimal: 450 },
      ph: { min: 6.0, max: 7.5, optimal: 6.5 },
      ec: { min: 1.2, max: 2.0, optimal: 1.6 }
    },
    baseYield: 0.35,
    basePrice: 4.0,
    seedCost: 0.8,
    unlockLevel: 2,
    sprites: {
      seed: '🌱',
      sprout: '🌿',
      vegetative: '🥬',
      flowering: '🥬',
      harvest: '🥬'
    },
    category: 'leafy'
  }
};

export const getCropById = (id: string): CropDefinition | undefined =>
  cropDefinitions[id];

export const getCropsByCategory = (category: string): CropDefinition[] =>
  Object.values(cropDefinitions).filter((crop) => crop.category === category);

export const getCropsByDifficulty = (difficulty: number): CropDefinition[] =>
  Object.values(cropDefinitions).filter((crop) => crop.difficulty === difficulty);

export const getUnlockedCrops = (level: number): CropDefinition[] =>
  Object.values(cropDefinitions).filter((crop) => crop.unlockLevel <= level);

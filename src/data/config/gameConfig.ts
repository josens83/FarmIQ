import type { GameConfig, TutorialStep, Achievement } from '../../types';

export const defaultGameConfig: GameConfig = {
  baseTickRate: 10,
  startingMoney: 10000,
  startingCrops: ['lettuce', 'spinach'],
  startingEquipment: ['basic-heater', 'basic-cooler', 'basic-fan'],
  energyCostPerKwh: 0.12,
  waterCostPerLiter: 0.002,
  farmGridSize: { width: 8, height: 6 },
  maxAutomationRules: 10,
  eventProbabilityBase: 0.01
};

// Environment natural change rates (per game hour)
export const environmentNaturalChanges = {
  temperatureNightDrop: -0.5,      // °C per hour during night
  temperatureDayRise: 0.3,         // °C per hour during day
  humidityEvaporation: -1,         // % per hour
  co2NaturalDecay: -10,            // ppm per hour
  soilMoistureDryRate: -2          // % per hour
};

// Sensor noise factors (for realistic readings)
export const sensorNoiseFactors = {
  temperature: 0.2,
  humidity: 1.0,
  co2: 5.0,
  light: 10.0,
  soilMoisture: 1.5,
  ph: 0.05,
  ec: 0.02
};

// Tutorial steps
export const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to FarmIQ',
    titleKo: 'FarmIQ에 오신 것을 환영합니다',
    content: 'Learn to manage a smart farm with IoT sensors and automation!',
    contentKo: 'IoT 센서와 자동화로 스마트팜을 관리하는 방법을 배워보세요!',
    position: 'bottom'
  },
  {
    id: 'dashboard',
    title: 'Sensor Dashboard',
    titleKo: '센서 대시보드',
    content: 'Monitor your farm environment in real-time with sensors.',
    contentKo: '센서로 농장 환경을 실시간으로 모니터링하세요.',
    highlight: '#sensor-panel',
    position: 'left'
  },
  {
    id: 'planting',
    title: 'Plant Your First Crop',
    titleKo: '첫 작물 심기',
    content: 'Click on an empty cell to plant your first crop.',
    contentKo: '빈 셀을 클릭하여 첫 작물을 심어보세요.',
    highlight: '#farm-grid',
    position: 'top',
    requiredAction: 'plant_crop'
  },
  {
    id: 'equipment',
    title: 'Control Equipment',
    titleKo: '장비 제어',
    content: 'Use equipment to maintain optimal growing conditions.',
    contentKo: '장비를 사용하여 최적의 재배 조건을 유지하세요.',
    highlight: '#control-panel',
    position: 'top'
  },
  {
    id: 'automation',
    title: 'Set Up Automation',
    titleKo: '자동화 설정',
    content: 'Create rules to automatically control equipment based on sensor readings.',
    contentKo: '센서 판독값에 따라 장비를 자동으로 제어하는 규칙을 만드세요.',
    highlight: '#automation-tab',
    position: 'right'
  },
  {
    id: 'harvest',
    title: 'Harvest and Sell',
    titleKo: '수확 및 판매',
    content: 'When crops are ready, harvest them to earn money and XP.',
    contentKo: '작물이 준비되면 수확하여 돈과 경험치를 얻으세요.',
    position: 'bottom'
  }
];

// Achievements
export const achievements: Achievement[] = [
  {
    id: 'first_harvest',
    name: 'First Harvest',
    nameKo: '첫 수확',
    description: 'Harvest your first crop',
    descriptionKo: '첫 작물을 수확하세요',
    icon: '🌾',
    requirement: { type: 'harvest', target: 1 },
    reward: { type: 'money', value: 100 },
    hidden: false
  },
  {
    id: 'green_thumb',
    name: 'Green Thumb',
    nameKo: '녹색 손',
    description: 'Harvest 10 crops',
    descriptionKo: '10개의 작물을 수확하세요',
    icon: '👍',
    requirement: { type: 'harvest', target: 10 },
    reward: { type: 'money', value: 500 },
    hidden: false
  },
  {
    id: 'master_farmer',
    name: 'Master Farmer',
    nameKo: '마스터 파머',
    description: 'Harvest 100 crops',
    descriptionKo: '100개의 작물을 수확하세요',
    icon: '🏆',
    requirement: { type: 'harvest', target: 100 },
    reward: { type: 'money', value: 5000 },
    hidden: false
  },
  {
    id: 'perfect_quality',
    name: 'Perfection',
    nameKo: '완벽함',
    description: 'Harvest an excellent quality crop',
    descriptionKo: '최상급 품질의 작물을 수확하세요',
    icon: '⭐',
    requirement: { type: 'quality', target: 90 },
    reward: { type: 'xp', value: 50 },
    hidden: false
  },
  {
    id: 'wealthy_farmer',
    name: 'Wealthy Farmer',
    nameKo: '부농',
    description: 'Earn $10,000 in total revenue',
    descriptionKo: '총 $10,000의 수익을 달성하세요',
    icon: '💰',
    requirement: { type: 'revenue', target: 10000 },
    reward: { type: 'money', value: 1000 },
    hidden: false
  },
  {
    id: 'automation_master',
    name: 'Automation Master',
    nameKo: '자동화 마스터',
    description: 'Create 5 automation rules',
    descriptionKo: '5개의 자동화 규칙을 만드세요',
    icon: '🤖',
    requirement: { type: 'special', target: 5 },
    reward: { type: 'xp', value: 100 },
    hidden: false
  },
  {
    id: 'week_streak',
    name: 'Dedicated Farmer',
    nameKo: '헌신적인 농부',
    description: 'Play for 7 in-game days',
    descriptionKo: '게임 내 7일 동안 플레이하세요',
    icon: '📅',
    requirement: { type: 'days', target: 7 },
    reward: { type: 'money', value: 500 },
    hidden: false
  }
];

export const getAchievementById = (id: string): Achievement | undefined =>
  achievements.find((a) => a.id === id);

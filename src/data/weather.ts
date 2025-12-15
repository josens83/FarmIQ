import type { WeatherConfig, WeatherType, Season, TreatmentOption } from '../types';

export const weatherConfigs: Record<WeatherType, WeatherConfig> = {
  clear: {
    id: 'clear',
    name: 'Clear',
    nameKo: '맑음',
    icon: '☀️',
    temperatureModifier: 2,
    humidityModifier: -5,
    lightModifier: 1.2,
    duration: { min: 12, max: 48 },
    probability: {
      spring: 0.3,
      summer: 0.4,
      fall: 0.35,
      winter: 0.25
    },
    effects: [
      { type: 'crop_growth', modifier: 1.1 },
      { type: 'energy_cost', modifier: 1.1 }
    ],
    description: 'Clear skies with optimal sunlight for plant growth.',
    descriptionKo: '맑은 하늘과 식물 성장에 최적의 햇빛.'
  },
  cloudy: {
    id: 'cloudy',
    name: 'Cloudy',
    nameKo: '흐림',
    icon: '☁️',
    temperatureModifier: -2,
    humidityModifier: 5,
    lightModifier: 0.7,
    duration: { min: 8, max: 36 },
    probability: {
      spring: 0.25,
      summer: 0.15,
      fall: 0.3,
      winter: 0.35
    },
    effects: [
      { type: 'crop_growth', modifier: 0.95 },
      { type: 'energy_cost', modifier: 0.9 }
    ],
    description: 'Overcast skies reducing natural light.',
    descriptionKo: '자연광을 줄이는 흐린 하늘.'
  },
  rainy: {
    id: 'rainy',
    name: 'Rainy',
    nameKo: '비',
    icon: '🌧️',
    temperatureModifier: -3,
    humidityModifier: 20,
    lightModifier: 0.5,
    duration: { min: 6, max: 24 },
    probability: {
      spring: 0.25,
      summer: 0.2,
      fall: 0.2,
      winter: 0.15
    },
    effects: [
      { type: 'crop_health', modifier: 1.05 },
      { type: 'pest_risk', modifier: 0.8 },
      { type: 'energy_cost', modifier: 0.85 }
    ],
    description: 'Rain provides natural humidity boost but reduces light.',
    descriptionKo: '비는 자연 습도를 높이지만 빛을 줄입니다.'
  },
  stormy: {
    id: 'stormy',
    name: 'Stormy',
    nameKo: '폭풍',
    icon: '⛈️',
    temperatureModifier: -5,
    humidityModifier: 30,
    lightModifier: 0.3,
    duration: { min: 4, max: 12 },
    probability: {
      spring: 0.1,
      summer: 0.15,
      fall: 0.08,
      winter: 0.05
    },
    effects: [
      { type: 'crop_health', modifier: 0.95 },
      { type: 'equipment_efficiency', modifier: 0.9 },
      { type: 'energy_cost', modifier: 1.2 }
    ],
    description: 'Severe weather may stress plants and affect equipment.',
    descriptionKo: '심한 날씨는 식물에 스트레스를 주고 장비에 영향을 줄 수 있습니다.'
  },
  heatwave: {
    id: 'heatwave',
    name: 'Heat Wave',
    nameKo: '폭염',
    icon: '🔥',
    temperatureModifier: 12,
    humidityModifier: -15,
    lightModifier: 1.4,
    duration: { min: 24, max: 72 },
    probability: {
      spring: 0.02,
      summer: 0.15,
      fall: 0.03,
      winter: 0
    },
    effects: [
      { type: 'crop_health', modifier: 0.9 },
      { type: 'pest_risk', modifier: 1.3 },
      { type: 'energy_cost', modifier: 1.5 }
    ],
    description: 'Extreme heat requires extra cooling and monitoring.',
    descriptionKo: '극심한 열은 추가 냉각과 모니터링이 필요합니다.'
  },
  cold_snap: {
    id: 'cold_snap',
    name: 'Cold Snap',
    nameKo: '한파',
    icon: '❄️',
    temperatureModifier: -15,
    humidityModifier: -10,
    lightModifier: 0.8,
    duration: { min: 24, max: 72 },
    probability: {
      spring: 0.03,
      summer: 0,
      fall: 0.05,
      winter: 0.2
    },
    effects: [
      { type: 'crop_growth', modifier: 0.7 },
      { type: 'crop_health', modifier: 0.85 },
      { type: 'energy_cost', modifier: 1.8 }
    ],
    description: 'Sudden temperature drop requiring heating systems.',
    descriptionKo: '난방 시스템이 필요한 급격한 온도 하락.'
  },
  foggy: {
    id: 'foggy',
    name: 'Foggy',
    nameKo: '안개',
    icon: '🌫️',
    temperatureModifier: -1,
    humidityModifier: 25,
    lightModifier: 0.4,
    duration: { min: 4, max: 16 },
    probability: {
      spring: 0.08,
      summer: 0.03,
      fall: 0.12,
      winter: 0.1
    },
    effects: [
      { type: 'crop_growth', modifier: 0.9 },
      { type: 'pest_risk', modifier: 1.2 }
    ],
    description: 'High humidity and low light can increase disease risk.',
    descriptionKo: '높은 습도와 낮은 빛은 질병 위험을 증가시킬 수 있습니다.'
  },
  windy: {
    id: 'windy',
    name: 'Windy',
    nameKo: '바람',
    icon: '💨',
    temperatureModifier: -2,
    humidityModifier: -10,
    lightModifier: 0.95,
    duration: { min: 8, max: 24 },
    probability: {
      spring: 0.15,
      summer: 0.1,
      fall: 0.15,
      winter: 0.15
    },
    effects: [
      { type: 'equipment_efficiency', modifier: 0.95 },
      { type: 'pest_risk', modifier: 0.7 }
    ],
    description: 'Wind helps with ventilation but may stress young plants.',
    descriptionKo: '바람은 환기에 도움이 되지만 어린 식물에 스트레스를 줄 수 있습니다.'
  }
};

export const getWeatherForSeason = (season: Season): WeatherType => {
  const configs = Object.values(weatherConfigs);
  const totalProbability = configs.reduce((sum, config) => sum + config.probability[season], 0);
  let random = Math.random() * totalProbability;

  for (const config of configs) {
    random -= config.probability[season];
    if (random <= 0) {
      return config.id;
    }
  }

  return 'clear';
};

export const getWeatherDuration = (weather: WeatherType): number => {
  const config = weatherConfigs[weather];
  const { min, max } = config.duration;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Treatment options for pest and disease management
export const treatmentOptions: TreatmentOption[] = [
  {
    id: 'neem-oil',
    name: 'Neem Oil Spray',
    nameKo: '님 오일 스프레이',
    type: 'organic',
    targetPests: ['aphids', 'spider_mites', 'whiteflies'],
    effectiveness: 0.7,
    cost: 15,
    applicationTime: 2,
    cooldownDays: 3,
    sideEffects: [
      { type: 'beneficial_insect_harm', severity: 0.2, duration: 24 }
    ]
  },
  {
    id: 'insecticidal-soap',
    name: 'Insecticidal Soap',
    nameKo: '살충 비누',
    type: 'organic',
    targetPests: ['aphids', 'whiteflies', 'thrips'],
    effectiveness: 0.65,
    cost: 10,
    applicationTime: 1,
    cooldownDays: 2
  },
  {
    id: 'pyrethrin',
    name: 'Pyrethrin Spray',
    nameKo: '피레트린 스프레이',
    type: 'chemical',
    targetPests: ['aphids', 'spider_mites', 'whiteflies', 'thrips', 'fungus_gnats'],
    effectiveness: 0.9,
    cost: 35,
    applicationTime: 2,
    cooldownDays: 7,
    sideEffects: [
      { type: 'quality_reduction', severity: 0.1, duration: 48 },
      { type: 'beneficial_insect_harm', severity: 0.5, duration: 72 }
    ]
  },
  {
    id: 'sticky-traps',
    name: 'Sticky Traps',
    nameKo: '끈끈이 트랩',
    type: 'organic',
    targetPests: ['whiteflies', 'fungus_gnats', 'thrips'],
    effectiveness: 0.5,
    cost: 5,
    applicationTime: 0.5,
    cooldownDays: 0
  },
  {
    id: 'beneficial-insects',
    name: 'Beneficial Insects',
    nameKo: '익충 도입',
    type: 'organic',
    targetPests: ['aphids', 'spider_mites', 'whiteflies'],
    effectiveness: 0.8,
    cost: 50,
    applicationTime: 1,
    cooldownDays: 14
  },
  {
    id: 'copper-fungicide',
    name: 'Copper Fungicide',
    nameKo: '구리 살균제',
    type: 'organic',
    targetDiseases: ['powdery_mildew', 'leaf_spot', 'damping_off'],
    effectiveness: 0.75,
    cost: 25,
    applicationTime: 2,
    cooldownDays: 7,
    sideEffects: [
      { type: 'growth_slowdown', severity: 0.1, duration: 24 }
    ]
  },
  {
    id: 'sulfur-spray',
    name: 'Sulfur Spray',
    nameKo: '유황 스프레이',
    type: 'organic',
    targetDiseases: ['powdery_mildew'],
    effectiveness: 0.85,
    cost: 20,
    applicationTime: 2,
    cooldownDays: 5
  },
  {
    id: 'systemic-fungicide',
    name: 'Systemic Fungicide',
    nameKo: '침투성 살균제',
    type: 'chemical',
    targetDiseases: ['powdery_mildew', 'botrytis', 'root_rot', 'leaf_spot', 'damping_off'],
    effectiveness: 0.95,
    cost: 60,
    applicationTime: 3,
    cooldownDays: 14,
    sideEffects: [
      { type: 'quality_reduction', severity: 0.15, duration: 72 },
      { type: 'growth_slowdown', severity: 0.1, duration: 48 }
    ]
  },
  {
    id: 'hydrogen-peroxide',
    name: 'Hydrogen Peroxide Treatment',
    nameKo: '과산화수소 처리',
    type: 'organic',
    targetDiseases: ['root_rot', 'damping_off'],
    effectiveness: 0.7,
    cost: 8,
    applicationTime: 1,
    cooldownDays: 3
  },
  {
    id: 'baking-soda-spray',
    name: 'Baking Soda Spray',
    nameKo: '베이킹소다 스프레이',
    type: 'organic',
    targetDiseases: ['powdery_mildew', 'leaf_spot'],
    effectiveness: 0.6,
    cost: 3,
    applicationTime: 1,
    cooldownDays: 2
  }
];

export const getTreatmentById = (id: string): TreatmentOption | undefined =>
  treatmentOptions.find(t => t.id === id);

export const getTreatmentsForPest = (pestType: string): TreatmentOption[] =>
  treatmentOptions.filter(t => t.targetPests?.includes(pestType as any));

export const getTreatmentsForDisease = (diseaseType: string): TreatmentOption[] =>
  treatmentOptions.filter(t => t.targetDiseases?.includes(diseaseType as any));

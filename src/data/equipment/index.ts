import type { EquipmentDefinition, EquipmentType } from '../../types';

export const equipmentDefinitions: Record<string, EquipmentDefinition> = {
  // Temperature Control
  'basic-heater': {
    id: 'basic-heater',
    type: 'heater',
    name: 'Basic Heater',
    nameKo: '기본 히터',
    description: 'Increases temperature in the growing area.',
    descriptionKo: '재배 공간의 온도를 높입니다.',
    baseCost: 500,
    maxLevel: 5,
    basePowerConsumption: 2.0,
    baseEffect: 2.0,
    effectUnit: '°C/hr',
    unlockLevel: 1,
    upgradeCostMultiplier: 1.5,
    icon: '🔥'
  },

  'advanced-heater': {
    id: 'advanced-heater',
    type: 'heater',
    name: 'Advanced Heater',
    nameKo: '고급 히터',
    description: 'High-efficiency heating system with precise control.',
    descriptionKo: '정밀 제어가 가능한 고효율 난방 시스템입니다.',
    baseCost: 1500,
    maxLevel: 5,
    basePowerConsumption: 3.5,
    baseEffect: 4.0,
    effectUnit: '°C/hr',
    unlockLevel: 4,
    upgradeCostMultiplier: 1.8,
    icon: '🔥'
  },

  'basic-cooler': {
    id: 'basic-cooler',
    type: 'cooler',
    name: 'Basic Cooler',
    nameKo: '기본 냉각기',
    description: 'Reduces temperature in the growing area.',
    descriptionKo: '재배 공간의 온도를 낮춥니다.',
    baseCost: 800,
    maxLevel: 5,
    basePowerConsumption: 3.0,
    baseEffect: 2.0,
    effectUnit: '°C/hr',
    unlockLevel: 1,
    upgradeCostMultiplier: 1.5,
    icon: '❄️'
  },

  'advanced-cooler': {
    id: 'advanced-cooler',
    type: 'cooler',
    name: 'Advanced Cooler',
    nameKo: '고급 냉각기',
    description: 'Industrial cooling system with high efficiency.',
    descriptionKo: '고효율 산업용 냉각 시스템입니다.',
    baseCost: 2000,
    maxLevel: 5,
    basePowerConsumption: 5.0,
    baseEffect: 4.0,
    effectUnit: '°C/hr',
    unlockLevel: 5,
    upgradeCostMultiplier: 1.8,
    icon: '❄️'
  },

  // Humidity Control
  'basic-humidifier': {
    id: 'basic-humidifier',
    type: 'humidifier',
    name: 'Humidifier',
    nameKo: '가습기',
    description: 'Increases humidity in the growing area.',
    descriptionKo: '재배 공간의 습도를 높입니다.',
    baseCost: 400,
    maxLevel: 5,
    basePowerConsumption: 0.5,
    baseEffect: 5.0,
    effectUnit: '%/hr',
    unlockLevel: 2,
    upgradeCostMultiplier: 1.4,
    icon: '💧'
  },

  'basic-dehumidifier': {
    id: 'basic-dehumidifier',
    type: 'dehumidifier',
    name: 'Dehumidifier',
    nameKo: '제습기',
    description: 'Reduces humidity in the growing area.',
    descriptionKo: '재배 공간의 습도를 낮춥니다.',
    baseCost: 450,
    maxLevel: 5,
    basePowerConsumption: 0.8,
    baseEffect: 5.0,
    effectUnit: '%/hr',
    unlockLevel: 2,
    upgradeCostMultiplier: 1.4,
    icon: '🌬️'
  },

  // Air Control
  'basic-fan': {
    id: 'basic-fan',
    type: 'fan',
    name: 'Ventilation Fan',
    nameKo: '환기 팬',
    description: 'Improves air circulation and reduces humidity.',
    descriptionKo: '공기 순환을 개선하고 습도를 낮춥니다.',
    baseCost: 300,
    maxLevel: 5,
    basePowerConsumption: 0.3,
    baseEffect: 3.0,
    effectUnit: '%/hr',
    unlockLevel: 1,
    upgradeCostMultiplier: 1.3,
    icon: '🌀'
  },

  'co2-generator': {
    id: 'co2-generator',
    type: 'co2_generator',
    name: 'CO2 Generator',
    nameKo: 'CO2 발생기',
    description: 'Increases CO2 levels for enhanced photosynthesis.',
    descriptionKo: '광합성 향상을 위해 CO2 농도를 높입니다.',
    baseCost: 2000,
    maxLevel: 5,
    basePowerConsumption: 1.5,
    baseEffect: 100,
    effectUnit: 'ppm/hr',
    unlockLevel: 5,
    upgradeCostMultiplier: 2.0,
    icon: '💨'
  },

  // Lighting
  'led-panel-basic': {
    id: 'led-panel-basic',
    type: 'led_panel',
    name: 'Basic LED Panel',
    nameKo: '기본 LED 패널',
    description: 'Standard LED grow light for plant growth.',
    descriptionKo: '식물 성장을 위한 표준 LED 조명입니다.',
    baseCost: 1200,
    maxLevel: 5,
    basePowerConsumption: 0.8,
    baseEffect: 200,
    effectUnit: 'PPFD',
    unlockLevel: 3,
    upgradeCostMultiplier: 1.6,
    icon: '💡'
  },

  'led-panel-spectrum': {
    id: 'led-panel-spectrum',
    type: 'led_panel',
    name: 'Full Spectrum LED',
    nameKo: '풀스펙트럼 LED',
    description: 'Advanced LED with adjustable spectrum control.',
    descriptionKo: '조절 가능한 스펙트럼 제어 기능의 고급 LED입니다.',
    baseCost: 3000,
    maxLevel: 5,
    basePowerConsumption: 1.5,
    baseEffect: 400,
    effectUnit: 'PPFD',
    unlockLevel: 6,
    upgradeCostMultiplier: 2.0,
    icon: '🌈'
  },

  // Irrigation
  'auto-irrigation': {
    id: 'auto-irrigation',
    type: 'irrigation',
    name: 'Auto Irrigation System',
    nameKo: '자동 관개 시스템',
    description: 'Automatically waters crops based on soil moisture.',
    descriptionKo: '토양 수분에 따라 자동으로 작물에 물을 줍니다.',
    baseCost: 1500,
    maxLevel: 5,
    basePowerConsumption: 0.2,
    baseEffect: 10,
    effectUnit: '%/cycle',
    unlockLevel: 4,
    upgradeCostMultiplier: 1.5,
    icon: '🚿'
  },

  'drip-irrigation': {
    id: 'drip-irrigation',
    type: 'irrigation',
    name: 'Drip Irrigation',
    nameKo: '점적 관개',
    description: 'Precision watering with minimal water waste.',
    descriptionKo: '물 낭비를 최소화하는 정밀 급수 시스템입니다.',
    baseCost: 2500,
    maxLevel: 5,
    basePowerConsumption: 0.15,
    baseEffect: 15,
    effectUnit: '%/cycle',
    unlockLevel: 6,
    upgradeCostMultiplier: 1.6,
    icon: '💦'
  },

  // Nutrient Control
  'nutrient-pump': {
    id: 'nutrient-pump',
    type: 'nutrient_pump',
    name: 'Nutrient Pump',
    nameKo: '양액 펌프',
    description: 'Automatically adjusts EC levels with nutrient solution.',
    descriptionKo: '양액으로 EC 수준을 자동 조절합니다.',
    baseCost: 2500,
    maxLevel: 5,
    basePowerConsumption: 0.3,
    baseEffect: 0.5,
    effectUnit: 'mS/cm/hr',
    unlockLevel: 6,
    upgradeCostMultiplier: 1.8,
    icon: '🧪'
  },

  'ph-controller': {
    id: 'ph-controller',
    type: 'nutrient_pump',
    name: 'pH Controller',
    nameKo: 'pH 조절기',
    description: 'Automatically maintains optimal pH levels.',
    descriptionKo: '최적의 pH 수준을 자동으로 유지합니다.',
    baseCost: 2000,
    maxLevel: 5,
    basePowerConsumption: 0.2,
    baseEffect: 0.2,
    effectUnit: 'pH/hr',
    unlockLevel: 5,
    upgradeCostMultiplier: 1.7,
    icon: '⚗️'
  }
};

export const getEquipmentById = (id: string): EquipmentDefinition | undefined =>
  equipmentDefinitions[id];

export const getEquipmentByType = (type: EquipmentType): EquipmentDefinition[] =>
  Object.values(equipmentDefinitions).filter((eq) => eq.type === type);

export const getUnlockedEquipment = (level: number): EquipmentDefinition[] =>
  Object.values(equipmentDefinitions).filter((eq) => eq.unlockLevel <= level);

export const getUpgradeCost = (equipmentId: string, currentLevel: number): number => {
  const definition = equipmentDefinitions[equipmentId];
  if (!definition || currentLevel >= definition.maxLevel) return Infinity;
  return Math.floor(definition.baseCost * Math.pow(definition.upgradeCostMultiplier, currentLevel));
};

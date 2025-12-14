import type { CropInstance, EnvironmentState, EquipmentInstance, GameTime, StressFactors } from '../types';
import { cropDefinitions } from '../data/crops';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create mock stress factors with optional overrides
 */
export function createMockStressFactors(overrides: Partial<StressFactors> = {}): StressFactors {
  return {
    temperature: 0,
    water: 0,
    nutrient: 0,
    disease: 0,
    ...overrides
  };
}

/**
 * Create a mock crop instance with optional overrides
 */
export function createMockCrop(overrides: Partial<CropInstance> = {}): CropInstance {
  return {
    instanceId: uuidv4(),
    cropId: 'lettuce',
    position: { x: 0, y: 0 },
    plantedAt: Date.now(),
    currentStage: 0,
    growthProgress: 0,
    health: 100,
    quality: 50,
    stressFactors: createMockStressFactors(),
    harvestable: false,
    wateredToday: false,
    ...overrides
  };
}

/**
 * Create optimal environment for a specific crop type
 */
export function createOptimalEnvironment(cropId: string): EnvironmentState {
  const definition = cropDefinitions[cropId];
  if (!definition) {
    return createMockEnvironment();
  }

  const optimalTemp = definition.optimalConditions.temperature.optimal;
  const optimalHumidity = definition.optimalConditions.humidity.optimal;
  const optimalLight = definition.optimalConditions.light.optimal;
  const optimalPH = definition.optimalConditions.ph.optimal;
  const optimalEC = definition.optimalConditions.ec.optimal;

  return createMockEnvironment({
    temperature: optimalTemp,
    humidity: optimalHumidity,
    lightIntensity: optimalLight,
    co2: 800,
    soilMoisture: 60,
    ph: optimalPH,
    ec: optimalEC
  });
}

/**
 * Create a mock environment with optional overrides
 */
export function createMockEnvironment(overrides: Partial<EnvironmentState> = {}): EnvironmentState {
  return {
    temperature: 22,
    humidity: 65,
    co2: 600,
    lightIntensity: 500,
    soilMoisture: 50,
    ph: 6.5,
    ec: 1.5,
    lightSpectrum: { blue: 30, red: 50, white: 20 },
    nutrientSolution: { nitrogen: 100, phosphorus: 50, potassium: 80 },
    ...overrides
  };
}

/**
 * Create a mock equipment instance with optional overrides
 */
export function createMockEquipment(overrides: Partial<EquipmentInstance> = {}): EquipmentInstance {
  return {
    id: uuidv4(),
    definitionId: 'basic-heater',
    type: 'heater',
    level: 1,
    efficiency: 100,
    powerConsumption: 2.0, // kW
    isActive: false,
    autoMode: false,
    ...overrides
  };
}

/**
 * Create a mock game time with optional overrides
 */
export function createMockGameTime(overrides: Partial<GameTime> = {}): GameTime {
  return {
    day: 1,
    hour: 12,
    minute: 0,
    totalTicks: 0,
    ticksPerSecond: 60,
    speed: 1,
    isPaused: false,
    ...overrides
  };
}

/**
 * Create system context for testing game systems
 */
export function createSystemContext(overrides: {
  gameTime?: Partial<GameTime>;
  environment?: Partial<EnvironmentState>;
  crops?: Partial<CropInstance>[];
  equipment?: Partial<EquipmentInstance>[];
} = {}) {
  return {
    gameTime: createMockGameTime(overrides.gameTime),
    environment: createMockEnvironment(overrides.environment),
    crops: (overrides.crops || []).map(c => createMockCrop(c)),
    equipment: (overrides.equipment || []).map(e => createMockEquipment(e))
  };
}

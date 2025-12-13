import type { OptimalConditions } from './environment';

// Crop Stage Types
export type CropStageId = 'seed' | 'sprout' | 'vegetative' | 'flowering' | 'harvest';

export interface CropStage {
  id: CropStageId;
  name: string;
  nameKo: string;
  daysRequired: number;
  waterNeed: number;      // multiplier
  nutrientNeed: number;   // multiplier
}

// Crop Definition (static data)
export interface CropDefinition {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  growthDays: number;
  stages: CropStage[];
  optimalConditions: OptimalConditions;
  baseYield: number;        // kg per plant
  basePrice: number;        // $ per kg
  seedCost: number;         // $ per seed
  unlockLevel: number;
  sprites: { [stage: string]: string };
  category: CropCategory;
}

export type CropCategory = 'leafy' | 'fruit' | 'herb' | 'root' | 'flower';

// Crop Instance (runtime data)
export interface CropInstance {
  instanceId: string;
  cropId: string;
  position: { x: number; y: number };
  plantedAt: number;        // game timestamp
  currentStage: number;     // stage index
  growthProgress: number;   // 0-100%
  health: number;           // 0-100%
  quality: number;          // 0-100%
  stressFactors: StressFactors;
  harvestable: boolean;
  wateredToday: boolean;
}

export interface StressFactors {
  temperature: number;      // 0-100 (0 = no stress, 100 = max stress)
  water: number;
  nutrient: number;
  disease: number;
}

// Harvest Result
export type HarvestQuality = 'poor' | 'normal' | 'good' | 'excellent';

export interface HarvestResult {
  cropId: string;
  instanceId: string;
  yield: number;            // kg
  quality: HarvestQuality;
  revenue: number;          // $
  xpGained: number;
}

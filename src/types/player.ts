// Player State Types
export interface PlayerState {
  money: number;
  experience: number;
  level: number;
  unlockedCrops: string[];
  unlockedEquipment: string[];
  techTree: { [nodeId: string]: boolean };
  achievements: string[];
  statistics: GameStatistics;
  settings: PlayerSettings;
}

export interface GameStatistics {
  totalHarvests: number;
  totalRevenue: number;
  totalExpenses: number;
  totalEnergyUsed: number;
  cropsGrown: { [cropId: string]: number };
  playTime: number;         // seconds
  daysPlayed: number;
  bestQualityHarvest: number;
  perfectHarvests: number;
}

export interface PlayerSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  language: 'ko' | 'en';
  showTutorial: boolean;
  autoSaveEnabled: boolean;
}

// Tech Tree Types
export interface TechTreeNode {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  cost: number;             // experience points or money
  costType: 'xp' | 'money';
  prerequisites: string[];  // node IDs
  unlocks: TechUnlock[];
  icon: string;
  category: TechCategory;
}

export type TechCategory = 'sensors' | 'automation' | 'crops' | 'efficiency' | 'special';

export interface TechUnlock {
  type: 'crop' | 'equipment' | 'feature' | 'bonus';
  id: string;
  value?: number;           // for bonus types
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  icon: string;
  requirement: AchievementRequirement;
  reward: AchievementReward;
  hidden: boolean;
}

export interface AchievementRequirement {
  type: 'harvest' | 'revenue' | 'crops' | 'days' | 'quality' | 'special';
  target: number;
  cropId?: string;
}

export interface AchievementReward {
  type: 'money' | 'xp' | 'unlock';
  value: number | string;
}

// Level Thresholds
export interface LevelInfo {
  level: number;
  xpRequired: number;
  rewards: LevelReward[];
}

export interface LevelReward {
  type: 'money' | 'unlock' | 'feature';
  value: number | string;
  description: string;
}

import type { EnvironmentState, Sensor, EnvironmentHistoryEntry } from './environment';
import type { CropInstance } from './crop';
import type { EquipmentInstance, AutomationRule } from './equipment';
import type { PlayerState } from './player';

// Game Time Types
export interface GameTime {
  day: number;              // current game day
  hour: number;             // 0-23
  minute: number;           // 0-59
  totalTicks: number;       // total game ticks elapsed
  ticksPerSecond: number;   // real-time ticks per second
  isPaused: boolean;
  speed: GameSpeed;
}

export type GameSpeed = 1 | 2 | 4 | 8;

// Farm Grid Types
export interface FarmGrid {
  width: number;
  height: number;
  cells: FarmCell[][];
}

export interface FarmCell {
  x: number;
  y: number;
  type: CellType;
  cropInstance?: CropInstance;
  sensor?: Sensor;
  equipment?: EquipmentInstance;
  isUnlocked: boolean;
}

export type CellType = 'soil' | 'water' | 'path' | 'structure';

// Game Event Types
export type EventSeverity = 'low' | 'medium' | 'high';
export type EventType = 'disease' | 'pest' | 'equipment_failure' | 'weather' | 'market' | 'achievement';

export interface GameEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  title: string;
  titleKo: string;
  message: string;
  messageKo: string;
  triggerConditions: EventCondition[];
  effects: EventEffect[];
  duration: number;         // game hours
  preventable: boolean;
  preventionCost: number;
  timestamp: number;
  isActive: boolean;
}

export interface EventCondition {
  type: 'environment' | 'crop' | 'time' | 'random';
  parameter?: string;
  operator: 'gt' | 'lt' | 'eq' | 'between';
  value: number | [number, number];
  probability?: number;
}

export interface EventEffect {
  type: 'damage' | 'bonus' | 'cost' | 'modifier';
  target: 'crops' | 'equipment' | 'money' | 'environment';
  value: number;
  duration?: number;
}

// Save Game Types
export interface SaveGame {
  version: string;
  timestamp: number;
  player: PlayerState;
  environment: EnvironmentState;
  environmentHistory: EnvironmentHistoryEntry[];
  crops: CropInstance[];
  equipment: EquipmentInstance[];
  sensors: Sensor[];
  automationRules: AutomationRule[];
  gameTime: GameTime;
  farmGrid: FarmGrid;
  activeEvents: GameEvent[];
}

// Game Configuration
export interface GameConfig {
  baseTickRate: number;       // ticks per game hour
  startingMoney: number;
  startingCrops: string[];
  startingEquipment: string[];
  energyCostPerKwh: number;
  waterCostPerLiter: number;
  farmGridSize: { width: number; height: number };
  maxAutomationRules: number;
  eventProbabilityBase: number;
}

// Notification Types
export interface GameNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  action?: NotificationAction;
}

export interface NotificationAction {
  label: string;
  handler: string;           // function name to call
}

// Tutorial Types
export interface TutorialStep {
  id: string;
  title: string;
  titleKo: string;
  content: string;
  contentKo: string;
  highlight?: string;        // element selector
  position: 'top' | 'bottom' | 'left' | 'right';
  requiredAction?: string;
}

export interface TutorialProgress {
  currentStep: number;
  completedSteps: string[];
  isActive: boolean;
}

// Equipment Types
export type EquipmentType =
  | 'heater'
  | 'cooler'
  | 'humidifier'
  | 'dehumidifier'
  | 'fan'
  | 'co2_generator'
  | 'led_panel'
  | 'irrigation'
  | 'nutrient_pump';

export interface EquipmentDefinition {
  id: string;
  type: EquipmentType;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  baseCost: number;
  maxLevel: number;
  basePowerConsumption: number;   // kWh
  baseEffect: number;             // effect per hour
  effectUnit: string;             // e.g., "°C", "%", "ppm"
  unlockLevel: number;
  upgradeCostMultiplier: number;
  icon: string;
}

export interface EquipmentInstance {
  id: string;
  definitionId: string;
  type: EquipmentType;
  level: number;            // upgrade level 1-5
  efficiency: number;       // 0-100%
  powerConsumption: number; // kWh (adjusted by level)
  isActive: boolean;
  autoMode: boolean;
  targetValue?: number;     // for auto mode
  position?: { x: number; y: number };
}

// Automation Types
export type AutomationCondition = 'above' | 'below' | 'between';
export type AutomationAction = 'activate' | 'deactivate' | 'setLevel';

export interface AutomationRule {
  id: string;
  name: string;
  sensorType: import('./environment').SensorType;
  equipmentId: string;
  condition: AutomationCondition;
  threshold: number | [number, number];
  action: AutomationAction;
  actionValue?: number;
  priority: number;
  isEnabled: boolean;
}

// Upgrade Info
export interface UpgradeInfo {
  equipmentId: string;
  currentLevel: number;
  nextLevel: number;
  upgradeCost: number;
  efficiencyGain: number;
  newPowerConsumption: number;
}

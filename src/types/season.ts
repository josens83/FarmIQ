// Season and Weather System Types

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface SeasonConfig {
  id: Season;
  name: string;
  nameKo: string;
  daysPerSeason: number;
  temperatureModifier: number;     // Added to base temperature
  humidityModifier: number;        // Added to base humidity
  lightModifier: number;           // Multiplier for light intensity
  growthRateModifier: number;      // Multiplier for crop growth
  pestRiskModifier: number;        // Multiplier for pest probability
  diseaseRiskModifier: number;     // Multiplier for disease probability
  marketPriceModifier: number;     // Multiplier for crop prices
  energyCostModifier: number;      // Multiplier for energy costs
  description: string;
  descriptionKo: string;
}

export type WeatherType =
  | 'clear'
  | 'cloudy'
  | 'rainy'
  | 'stormy'
  | 'heatwave'
  | 'cold_snap'
  | 'foggy'
  | 'windy';

export interface WeatherConfig {
  id: WeatherType;
  name: string;
  nameKo: string;
  icon: string;
  temperatureModifier: number;
  humidityModifier: number;
  lightModifier: number;
  duration: { min: number; max: number };  // in game hours
  probability: Record<Season, number>;     // probability per season
  effects: WeatherEffect[];
  description: string;
  descriptionKo: string;
}

export interface WeatherEffect {
  type: 'crop_growth' | 'crop_health' | 'energy_cost' | 'equipment_efficiency' | 'pest_risk';
  modifier: number;
}

export interface WeatherState {
  current: WeatherType;
  temperature: number;
  humidity: number;
  windSpeed: number;
  startTime: number;      // game tick when weather started
  duration: number;       // how many ticks weather lasts
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  day: number;
  weather: WeatherType;
  highTemp: number;
  lowTemp: number;
  rainChance: number;
}

export interface SeasonState {
  current: Season;
  dayOfSeason: number;
  year: number;
  daysPerSeason: number;
}

// Market System Types
export interface MarketState {
  prices: Record<string, MarketPrice>;
  priceHistory: MarketPriceHistory[];
  demandLevels: Record<string, DemandLevel>;
  lastUpdate: number;
}

export interface MarketPrice {
  cropId: string;
  basePrice: number;
  currentPrice: number;
  priceChange: number;        // percentage change from base
  trend: 'rising' | 'falling' | 'stable';
  volatility: number;         // 0-1, how much price fluctuates
}

export interface MarketPriceHistory {
  day: number;
  prices: Record<string, number>;
}

export type DemandLevel = 'very_low' | 'low' | 'normal' | 'high' | 'very_high';

export interface MarketEvent {
  id: string;
  type: 'surplus' | 'shortage' | 'trend' | 'special';
  cropId?: string;
  priceMultiplier: number;
  duration: number;           // in game days
  title: string;
  titleKo: string;
  description: string;
  descriptionKo: string;
}

// Resource Management Types
export interface ResourceState {
  water: WaterResource;
  nutrients: NutrientResource;
  energy: EnergyResource;
}

export interface WaterResource {
  available: number;          // liters available
  capacity: number;           // max storage capacity
  dailyUsage: number;
  efficiency: number;         // 0-1, water recycling efficiency
  costPerLiter: number;
  autoRefill: boolean;
}

export interface NutrientResource {
  nitrogen: number;           // kg available
  phosphorus: number;
  potassium: number;
  capacity: number;
  dailyUsage: { n: number; p: number; k: number };
  costPerKg: number;
  autoRefill: boolean;
}

export interface EnergyResource {
  dailyUsage: number;         // kWh
  peakUsage: number;
  costPerKwh: number;
  solarGeneration: number;    // kWh from solar panels
  efficiency: number;         // equipment efficiency modifier
}

// Pest & Disease Management Types
export type PestType = 'aphids' | 'spider_mites' | 'whiteflies' | 'thrips' | 'fungus_gnats';
export type DiseaseType = 'powdery_mildew' | 'botrytis' | 'root_rot' | 'leaf_spot' | 'damping_off';

export interface PestInstance {
  id: string;
  type: PestType;
  severity: number;           // 0-100
  spreadRate: number;         // how fast it spreads
  affectedCells: string[];    // cell IDs affected
  dayDetected: number;
  treated: boolean;
}

export interface DiseaseInstance {
  id: string;
  type: DiseaseType;
  severity: number;
  spreadRate: number;
  affectedCells: string[];
  dayDetected: number;
  treated: boolean;
}

export interface TreatmentOption {
  id: string;
  name: string;
  nameKo: string;
  type: 'organic' | 'chemical';
  targetPests?: PestType[];
  targetDiseases?: DiseaseType[];
  effectiveness: number;      // 0-1
  cost: number;
  applicationTime: number;    // game hours
  cooldownDays: number;
  sideEffects?: TreatmentSideEffect[];
}

export interface TreatmentSideEffect {
  type: 'quality_reduction' | 'growth_slowdown' | 'beneficial_insect_harm';
  severity: number;
  duration: number;
}

export interface PestDiseaseState {
  activePests: PestInstance[];
  activeDiseases: DiseaseInstance[];
  preventionLevel: number;    // 0-100, general prevention measures
  lastInspection: number;
  treatmentHistory: TreatmentRecord[];
}

export interface TreatmentRecord {
  day: number;
  treatmentId: string;
  targetType: 'pest' | 'disease';
  targetId: string;
  success: boolean;
}

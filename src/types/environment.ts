// Environment State Types
export interface LightSpectrum {
  blue: number;   // % (0-100)
  red: number;    // % (0-100)
  white: number;  // % (0-100)
}

export interface NutrientSolution {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

export interface EnvironmentState {
  temperature: number;        // °C (0-50)
  humidity: number;           // % (0-100)
  co2: number;                // ppm (0-5000)
  lightIntensity: number;     // μmol/m²/s (0-2500)
  lightSpectrum: LightSpectrum;
  soilMoisture: number;       // % (0-100)
  ph: number;                 // (0-14)
  ec: number;                 // mS/cm (0-10)
  nutrientSolution: NutrientSolution;
}

export interface EnvironmentRange {
  min: number;
  max: number;
  optimal: number;
}

export interface OptimalConditions {
  temperature: EnvironmentRange;
  humidity: EnvironmentRange;
  light: EnvironmentRange;
  ph: EnvironmentRange;
  ec: EnvironmentRange;
}

// Sensor Types
export type SensorType = 'temperature' | 'humidity' | 'co2' | 'light' | 'soil' | 'ph' | 'ec';

export interface Sensor {
  id: string;
  type: SensorType;
  position: { x: number; y: number };
  accuracy: number;         // 0-100%
  updateInterval: number;   // game ticks
  lastReading: number;
  isActive: boolean;
}

export interface SensorReading {
  sensorId: string;
  type: SensorType;
  value: number;
  timestamp: number;
  isInOptimalRange: boolean;
}

// Environment History
export interface EnvironmentHistoryEntry {
  timestamp: number;
  temperature: number;
  humidity: number;
  co2: number;
  lightIntensity: number;
  soilMoisture: number;
  ph: number;
  ec: number;
}

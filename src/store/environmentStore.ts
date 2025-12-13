import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EnvironmentState, Sensor, EnvironmentHistoryEntry, SensorType } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface EnvironmentStore {
  environment: EnvironmentState;
  sensors: Sensor[];
  history: EnvironmentHistoryEntry[];

  // Environment Updates
  updateEnvironment: (updates: Partial<EnvironmentState>) => void;
  setTemperature: (value: number) => void;
  setHumidity: (value: number) => void;
  setCO2: (value: number) => void;
  setLightIntensity: (value: number) => void;
  setSoilMoisture: (value: number) => void;
  setPH: (value: number) => void;
  setEC: (value: number) => void;

  // Sensor Management
  addSensor: (type: SensorType, position: { x: number; y: number }) => string;
  removeSensor: (id: string) => void;
  toggleSensor: (id: string) => void;
  updateSensorReading: (id: string, value: number) => void;

  // History Management
  recordHistory: () => void;
  clearHistory: () => void;

  // Reset
  resetEnvironment: () => void;
}

const initialEnvironment: EnvironmentState = {
  temperature: 22,
  humidity: 60,
  co2: 600,
  lightIntensity: 400,
  lightSpectrum: { blue: 30, red: 50, white: 20 },
  soilMoisture: 65,
  ph: 6.5,
  ec: 1.5,
  nutrientSolution: { nitrogen: 100, phosphorus: 50, potassium: 80 }
};

// Clamp value within range
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const useEnvironmentStore = create<EnvironmentStore>()(
  persist(
    (set, get) => ({
      environment: initialEnvironment,
      sensors: [],
      history: [],

      updateEnvironment: (updates) => set((state) => ({
        environment: {
          ...state.environment,
          ...updates,
          temperature: clamp(updates.temperature ?? state.environment.temperature, 0, 50),
          humidity: clamp(updates.humidity ?? state.environment.humidity, 0, 100),
          co2: clamp(updates.co2 ?? state.environment.co2, 0, 5000),
          lightIntensity: clamp(updates.lightIntensity ?? state.environment.lightIntensity, 0, 2500),
          soilMoisture: clamp(updates.soilMoisture ?? state.environment.soilMoisture, 0, 100),
          ph: clamp(updates.ph ?? state.environment.ph, 0, 14),
          ec: clamp(updates.ec ?? state.environment.ec, 0, 10)
        }
      })),

      setTemperature: (value) => set((state) => ({
        environment: { ...state.environment, temperature: clamp(value, 0, 50) }
      })),

      setHumidity: (value) => set((state) => ({
        environment: { ...state.environment, humidity: clamp(value, 0, 100) }
      })),

      setCO2: (value) => set((state) => ({
        environment: { ...state.environment, co2: clamp(value, 0, 5000) }
      })),

      setLightIntensity: (value) => set((state) => ({
        environment: { ...state.environment, lightIntensity: clamp(value, 0, 2500) }
      })),

      setSoilMoisture: (value) => set((state) => ({
        environment: { ...state.environment, soilMoisture: clamp(value, 0, 100) }
      })),

      setPH: (value) => set((state) => ({
        environment: { ...state.environment, ph: clamp(value, 0, 14) }
      })),

      setEC: (value) => set((state) => ({
        environment: { ...state.environment, ec: clamp(value, 0, 10) }
      })),

      addSensor: (type, position) => {
        const id = uuidv4();
        const sensor: Sensor = {
          id,
          type,
          position,
          accuracy: 95,
          updateInterval: 10,
          lastReading: get().environment[
            type === 'temperature' ? 'temperature' :
            type === 'humidity' ? 'humidity' :
            type === 'co2' ? 'co2' :
            type === 'light' ? 'lightIntensity' :
            type === 'soil' ? 'soilMoisture' :
            type === 'ph' ? 'ph' : 'ec'
          ],
          isActive: true
        };
        set((state) => ({ sensors: [...state.sensors, sensor] }));
        return id;
      },

      removeSensor: (id) => set((state) => ({
        sensors: state.sensors.filter((s) => s.id !== id)
      })),

      toggleSensor: (id) => set((state) => ({
        sensors: state.sensors.map((s) =>
          s.id === id ? { ...s, isActive: !s.isActive } : s
        )
      })),

      updateSensorReading: (id, value) => set((state) => ({
        sensors: state.sensors.map((s) =>
          s.id === id ? { ...s, lastReading: value } : s
        )
      })),

      recordHistory: () => set((state) => {
        const entry: EnvironmentHistoryEntry = {
          timestamp: Date.now(),
          temperature: state.environment.temperature,
          humidity: state.environment.humidity,
          co2: state.environment.co2,
          lightIntensity: state.environment.lightIntensity,
          soilMoisture: state.environment.soilMoisture,
          ph: state.environment.ph,
          ec: state.environment.ec
        };
        return {
          history: [...state.history.slice(-287), entry] // Keep last 24 hours (288 entries at 5-min intervals)
        };
      }),

      clearHistory: () => set({ history: [] }),

      resetEnvironment: () => set({
        environment: initialEnvironment,
        sensors: [],
        history: []
      })
    }),
    {
      name: 'farmiq-environment-store',
      partialize: (state) => ({
        environment: state.environment,
        sensors: state.sensors,
        history: state.history
      })
    }
  )
);

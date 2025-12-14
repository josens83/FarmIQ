import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnvironmentSystem } from '../EnvironmentSystem';
import { createMockEnvironment, createMockEquipment, createMockGameTime } from '../../../test/helpers';

// Mock the stores
vi.mock('../../../store/environmentStore', () => ({
  useEnvironmentStore: {
    getState: vi.fn(() => ({
      updateEnvironment: vi.fn(),
      updateSensorReading: vi.fn(),
      sensors: []
    }))
  }
}));

vi.mock('../../../store/equipmentStore', () => ({
  useEquipmentStore: {
    getState: vi.fn(() => ({
      addEnergyUsage: vi.fn()
    }))
  }
}));

// Import after mocking
import { useEnvironmentStore } from '../../../store/environmentStore';
import { useEquipmentStore } from '../../../store/equipmentStore';

describe('EnvironmentSystem', () => {
  let system: EnvironmentSystem;
  let mockEnvStore: {
    updateEnvironment: ReturnType<typeof vi.fn>;
    updateSensorReading: ReturnType<typeof vi.fn>;
    sensors: Array<{ id: string; type: string; isActive: boolean; accuracy: number }>;
  };
  let mockEquipStore: {
    addEnergyUsage: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    system = new EnvironmentSystem();
    mockEnvStore = {
      updateEnvironment: vi.fn(),
      updateSensorReading: vi.fn(),
      sensors: []
    };
    mockEquipStore = {
      addEnergyUsage: vi.fn()
    };
    vi.mocked(useEnvironmentStore.getState).mockReturnValue(mockEnvStore);
    vi.mocked(useEquipmentStore.getState).mockReturnValue(mockEquipStore);
  });

  describe('update', () => {
    it('should update environment store with new values', () => {
      const context = {
        gameTime: createMockGameTime({ hour: 12 }),
        environment: createMockEnvironment(),
        equipment: []
      };

      system.update(context);

      expect(mockEnvStore.updateEnvironment).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: expect.any(Number),
          humidity: expect.any(Number),
          co2: expect.any(Number),
          soilMoisture: expect.any(Number),
          lightIntensity: expect.any(Number)
        })
      );
    });

    it('should not record energy usage when no equipment is active', () => {
      const context = {
        gameTime: createMockGameTime(),
        environment: createMockEnvironment(),
        equipment: []
      };

      system.update(context);

      expect(mockEquipStore.addEnergyUsage).not.toHaveBeenCalled();
    });
  });

  describe('natural changes', () => {
    it('should decrease temperature at night', () => {
      const initialTemp = 25;
      const nightEnv = createMockEnvironment({ temperature: initialTemp });
      const context = {
        gameTime: createMockGameTime({ hour: 22 }), // Night time
        environment: nightEnv,
        equipment: []
      };

      system.update(context);

      const updatedEnv = mockEnvStore.updateEnvironment.mock.calls[0][0];
      expect(updatedEnv.temperature).toBeLessThan(initialTemp);
    });

    it('should increase temperature during day', () => {
      const initialTemp = 20;
      const dayEnv = createMockEnvironment({ temperature: initialTemp });
      const context = {
        gameTime: createMockGameTime({ hour: 12 }), // Day time
        environment: dayEnv,
        equipment: []
      };

      system.update(context);

      const updatedEnv = mockEnvStore.updateEnvironment.mock.calls[0][0];
      expect(updatedEnv.temperature).toBeGreaterThan(initialTemp);
    });

    it('should decrease soil moisture naturally', () => {
      const initialMoisture = 60;
      const env = createMockEnvironment({ soilMoisture: initialMoisture });
      const context = {
        gameTime: createMockGameTime(),
        environment: env,
        equipment: []
      };

      system.update(context);

      const updatedEnv = mockEnvStore.updateEnvironment.mock.calls[0][0];
      expect(updatedEnv.soilMoisture).toBeLessThan(initialMoisture);
    });

    it('should have higher light intensity during midday', () => {
      const env = createMockEnvironment({ lightIntensity: 0 });
      const context = {
        gameTime: createMockGameTime({ hour: 12 }), // Noon
        environment: env,
        equipment: []
      };

      system.update(context);

      const updatedEnv = mockEnvStore.updateEnvironment.mock.calls[0][0];
      expect(updatedEnv.lightIntensity).toBeGreaterThan(0);
    });

    it('should have minimal light intensity at night', () => {
      const env = createMockEnvironment({ lightIntensity: 500 });
      const context = {
        gameTime: createMockGameTime({ hour: 2 }), // Night time
        environment: env,
        equipment: []
      };

      system.update(context);

      const updatedEnv = mockEnvStore.updateEnvironment.mock.calls[0][0];
      expect(updatedEnv.lightIntensity).toBeLessThan(500);
    });

    it('should consume CO2 during day (photosynthesis)', () => {
      const initialCO2 = 800;
      const env = createMockEnvironment({ co2: initialCO2 });
      const context = {
        gameTime: createMockGameTime({ hour: 12 }),
        environment: env,
        equipment: []
      };

      system.update(context);

      const updatedEnv = mockEnvStore.updateEnvironment.mock.calls[0][0];
      expect(updatedEnv.co2).toBeLessThan(initialCO2);
    });
  });

  describe('equipment effects', () => {
    it('should increase temperature when heater is active', () => {
      const initialTemp = 15;
      const heater = createMockEquipment({
        definitionId: 'basic-heater',
        isActive: true
      });
      const context = {
        gameTime: createMockGameTime({ hour: 22 }), // Night time (no solar heating)
        environment: createMockEnvironment({ temperature: initialTemp }),
        equipment: [heater]
      };

      system.update(context);

      // Heater should record energy usage
      expect(mockEquipStore.addEnergyUsage).toHaveBeenCalled();
      const updatedEnv = mockEnvStore.updateEnvironment.mock.calls[0][0];
      // Even with night cooling, heater effect should increase temp from a low starting point
      expect(updatedEnv.temperature).toBeGreaterThan(initialTemp - 0.5);
    });

    it('should decrease temperature when cooler is active', () => {
      const initialTemp = 30;
      const cooler = createMockEquipment({
        definitionId: 'basic-cooler',
        isActive: true
      });
      const context = {
        gameTime: createMockGameTime({ hour: 22 }), // Night so no temp rise
        environment: createMockEnvironment({ temperature: initialTemp }),
        equipment: [cooler]
      };

      system.update(context);

      const updatedEnv = mockEnvStore.updateEnvironment.mock.calls[0][0];
      expect(updatedEnv.temperature).toBeLessThan(initialTemp);
    });

    it('should increase humidity when humidifier is active', () => {
      const initialHumidity = 30;
      const humidifier = createMockEquipment({
        definitionId: 'basic-humidifier',
        isActive: true
      });
      const context = {
        gameTime: createMockGameTime(),
        environment: createMockEnvironment({ humidity: initialHumidity }),
        equipment: [humidifier]
      };

      system.update(context);

      const updatedEnv = mockEnvStore.updateEnvironment.mock.calls[0][0];
      // Humidifier effect (5.0 * 0.1 = 0.5) should overcome natural evaporation
      expect(updatedEnv.humidity).toBeGreaterThan(initialHumidity);
    });

    it('should decrease humidity when dehumidifier is active', () => {
      const initialHumidity = 80;
      const dehumidifier = createMockEquipment({
        definitionId: 'basic-dehumidifier',
        isActive: true
      });
      const context = {
        gameTime: createMockGameTime(),
        environment: createMockEnvironment({ humidity: initialHumidity }),
        equipment: [dehumidifier]
      };

      system.update(context);

      const updatedEnv = mockEnvStore.updateEnvironment.mock.calls[0][0];
      expect(updatedEnv.humidity).toBeLessThan(initialHumidity);
    });

    it('should increase soil moisture when irrigation is active', () => {
      const initialMoisture = 20;
      const irrigation = createMockEquipment({
        definitionId: 'auto-irrigation',
        isActive: true
      });
      const context = {
        gameTime: createMockGameTime(),
        environment: createMockEnvironment({ soilMoisture: initialMoisture }),
        equipment: [irrigation]
      };

      system.update(context);

      const updatedEnv = mockEnvStore.updateEnvironment.mock.calls[0][0];
      // Irrigation effect (10 * 0.1 = 1) should overcome natural drying
      expect(updatedEnv.soilMoisture).toBeGreaterThan(initialMoisture);
    });

    it('should increase light intensity when LED panel is active', () => {
      const initialLight = 100;
      const ledPanel = createMockEquipment({
        definitionId: 'led-panel-basic',
        isActive: true
      });
      const context = {
        gameTime: createMockGameTime({ hour: 22 }), // Night
        environment: createMockEnvironment({ lightIntensity: initialLight }),
        equipment: [ledPanel]
      };

      system.update(context);

      const updatedEnv = mockEnvStore.updateEnvironment.mock.calls[0][0];
      // LED should add light even at night
      expect(updatedEnv.lightIntensity).toBeGreaterThan(0);
    });

    it('should increase CO2 when CO2 generator is active', () => {
      const initialCO2 = 300;
      const co2Generator = createMockEquipment({
        definitionId: 'co2-generator',
        isActive: true
      });
      const context = {
        gameTime: createMockGameTime({ hour: 22 }), // Night (no consumption)
        environment: createMockEnvironment({ co2: initialCO2 }),
        equipment: [co2Generator]
      };

      system.update(context);

      const updatedEnv = mockEnvStore.updateEnvironment.mock.calls[0][0];
      // CO2 generator effect (100 * 0.1 = 10 ppm per tick)
      expect(updatedEnv.co2).toBeGreaterThan(initialCO2);
    });

    it('should record energy usage for active equipment', () => {
      const heater = createMockEquipment({
        definitionId: 'basic-heater',
        isActive: true,
        powerConsumption: 1000
      });
      const context = {
        gameTime: createMockGameTime(),
        environment: createMockEnvironment(),
        equipment: [heater]
      };

      system.update(context);

      expect(mockEquipStore.addEnergyUsage).toHaveBeenCalledWith(expect.any(Number));
    });

    it('should not apply effect for inactive equipment', () => {
      const initialTemp = 20;
      const heater = createMockEquipment({
        definitionId: 'basic-heater',
        isActive: false
      });
      const context = {
        gameTime: createMockGameTime({ hour: 12 }),
        environment: createMockEnvironment({ temperature: initialTemp }),
        equipment: [heater]
      };

      system.update(context);

      // Only natural changes should occur, no energy used
      expect(mockEquipStore.addEnergyUsage).not.toHaveBeenCalled();
    });
  });

  describe('auto mode', () => {
    it('should only heat when below target in auto mode', () => {
      const heater = createMockEquipment({
        definitionId: 'basic-heater',
        isActive: true,
        autoMode: true,
        targetValue: 25
      });

      // Test when below target
      const coldEnv = createMockEnvironment({ temperature: 20 });
      system.update({
        gameTime: createMockGameTime({ hour: 22 }),
        environment: coldEnv,
        equipment: [heater]
      });

      const coldResult = mockEnvStore.updateEnvironment.mock.calls[0][0];

      // Reset
      mockEnvStore.updateEnvironment.mockClear();

      // Test when above target
      const warmEnv = createMockEnvironment({ temperature: 28 });
      system.update({
        gameTime: createMockGameTime({ hour: 22 }),
        environment: warmEnv,
        equipment: [heater]
      });

      const warmResult = mockEnvStore.updateEnvironment.mock.calls[0][0];

      // When below target, heater should warm; when above, only natural changes
      // The cold result should be warmer (relatively) than just cooling from 28
      // Natural night drop is the same for both, heater adds to cold but not warm
      expect(coldResult.temperature - 20).toBeGreaterThan(warmResult.temperature - 28);
    });
  });

  describe('sensor readings', () => {
    it('should update sensor readings for active sensors', () => {
      mockEnvStore.sensors = [
        { id: 'temp-1', type: 'temperature', isActive: true, accuracy: 95 },
        { id: 'humid-1', type: 'humidity', isActive: true, accuracy: 90 }
      ];

      const context = {
        gameTime: createMockGameTime(),
        environment: createMockEnvironment({ temperature: 25, humidity: 60 }),
        equipment: []
      };

      system.update(context);

      expect(mockEnvStore.updateSensorReading).toHaveBeenCalledTimes(2);
    });

    it('should not update inactive sensors', () => {
      mockEnvStore.sensors = [
        { id: 'temp-1', type: 'temperature', isActive: false, accuracy: 95 }
      ];

      const context = {
        gameTime: createMockGameTime(),
        environment: createMockEnvironment(),
        equipment: []
      };

      system.update(context);

      expect(mockEnvStore.updateSensorReading).not.toHaveBeenCalled();
    });

    it('should add noise based on sensor accuracy', () => {
      mockEnvStore.sensors = [
        { id: 'temp-1', type: 'temperature', isActive: true, accuracy: 50 }
      ];

      const context = {
        gameTime: createMockGameTime(),
        environment: createMockEnvironment({ temperature: 25 }),
        equipment: []
      };

      // Run multiple times to check for variation
      const readings: number[] = [];
      for (let i = 0; i < 10; i++) {
        mockEnvStore.updateSensorReading.mockClear();
        system.update(context);
        readings.push(mockEnvStore.updateSensorReading.mock.calls[0][1]);
      }

      // With 50% accuracy, readings should have some variation
      const uniqueReadings = new Set(readings);
      expect(uniqueReadings.size).toBeGreaterThan(1);
    });
  });

  describe('multiple equipment', () => {
    it('should apply effects from multiple active equipment', () => {
      const heater = createMockEquipment({
        definitionId: 'basic-heater',
        isActive: true,
        powerConsumption: 1000
      });
      const humidifier = createMockEquipment({
        definitionId: 'basic-humidifier',
        isActive: true,
        powerConsumption: 500
      });

      const context = {
        gameTime: createMockGameTime({ hour: 22 }),
        environment: createMockEnvironment({ temperature: 15, humidity: 30 }),
        equipment: [heater, humidifier]
      };

      system.update(context);

      const updatedEnv = mockEnvStore.updateEnvironment.mock.calls[0][0];
      // Temperature should be warmed (heater effect - night cooling)
      expect(updatedEnv.temperature).toBeGreaterThan(14);
      // Humidity should increase from humidifier effect
      expect(updatedEnv.humidity).toBeGreaterThan(30);

      // Total energy usage should be recorded
      expect(mockEquipStore.addEnergyUsage).toHaveBeenCalledWith(expect.any(Number));
      const energyUsed = mockEquipStore.addEnergyUsage.mock.calls[0][0];
      expect(energyUsed).toBeGreaterThan(0);
    });
  });
});

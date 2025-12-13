import { useEnvironmentStore } from '../../store/environmentStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { equipmentDefinitions } from '../../data/equipment';
import { environmentNaturalChanges } from '../../data/config/gameConfig';
import type { GameTime, EnvironmentState, EquipmentInstance } from '../../types';

interface SystemContext {
  gameTime: GameTime;
  environment: EnvironmentState;
  equipment: EquipmentInstance[];
}

export class EnvironmentSystem {
  update(context: SystemContext): void {
    const environmentStore = useEnvironmentStore.getState();
    const equipmentStore = useEquipmentStore.getState();

    // Get current environment
    const env = { ...context.environment };
    const hour = context.gameTime.hour;

    // 1. Apply natural changes based on time of day
    this.applyNaturalChanges(env, hour);

    // 2. Apply equipment effects
    let totalEnergyUsed = 0;
    for (const equipment of context.equipment) {
      if (equipment.isActive) {
        const energyUsed = this.applyEquipmentEffect(env, equipment);
        totalEnergyUsed += energyUsed;
      }
    }

    // 3. Record energy usage
    if (totalEnergyUsed > 0) {
      equipmentStore.addEnergyUsage(totalEnergyUsed);
    }

    // 4. Update environment store
    environmentStore.updateEnvironment(env);

    // 5. Update sensor readings
    this.updateSensorReadings(env);
  }

  private applyNaturalChanges(env: EnvironmentState, hour: number): void {
    // Temperature changes based on day/night cycle
    const isNight = hour >= 20 || hour < 6;
    const tempChange = isNight
      ? environmentNaturalChanges.temperatureNightDrop
      : environmentNaturalChanges.temperatureDayRise;

    env.temperature += tempChange * 0.1; // Scale down for per-tick changes

    // Natural humidity evaporation
    env.humidity += environmentNaturalChanges.humidityEvaporation * 0.1;

    // Natural CO2 decay (plants consume CO2 during day)
    if (!isNight) {
      env.co2 += environmentNaturalChanges.co2NaturalDecay * 0.1;
    }

    // Soil moisture naturally decreases
    env.soilMoisture += environmentNaturalChanges.soilMoistureDryRate * 0.1;

    // Light intensity based on time of day
    if (hour >= 6 && hour < 20) {
      // Calculate sunlight curve (peaks at noon)
      const dayProgress = (hour - 6) / 14;
      const sunIntensity = Math.sin(dayProgress * Math.PI) * 500;
      env.lightIntensity = Math.max(env.lightIntensity * 0.9, sunIntensity);
    } else {
      // Night time - minimal natural light
      env.lightIntensity *= 0.95;
      env.lightIntensity = Math.max(0, env.lightIntensity);
    }
  }

  private applyEquipmentEffect(env: EnvironmentState, equipment: EquipmentInstance): number {
    const definition = equipmentDefinitions[equipment.definitionId];
    if (!definition) return 0;

    const levelMultiplier = 1 + (equipment.level - 1) * 0.15;
    const efficiencyMultiplier = equipment.efficiency / 100;
    const effect = definition.baseEffect * levelMultiplier * efficiencyMultiplier * 0.1; // Scale for per-tick

    switch (definition.type) {
      case 'heater':
        if (equipment.autoMode && equipment.targetValue !== undefined) {
          if (env.temperature < equipment.targetValue) {
            env.temperature += effect;
          }
        } else {
          env.temperature += effect;
        }
        break;

      case 'cooler':
        if (equipment.autoMode && equipment.targetValue !== undefined) {
          if (env.temperature > equipment.targetValue) {
            env.temperature -= effect;
          }
        } else {
          env.temperature -= effect;
        }
        break;

      case 'humidifier':
        if (equipment.autoMode && equipment.targetValue !== undefined) {
          if (env.humidity < equipment.targetValue) {
            env.humidity += effect;
          }
        } else {
          env.humidity += effect;
        }
        break;

      case 'dehumidifier':
        if (equipment.autoMode && equipment.targetValue !== undefined) {
          if (env.humidity > equipment.targetValue) {
            env.humidity -= effect;
          }
        } else {
          env.humidity -= effect;
        }
        break;

      case 'fan':
        // Fan reduces humidity and helps regulate temperature
        env.humidity -= effect;
        break;

      case 'co2_generator':
        if (equipment.autoMode && equipment.targetValue !== undefined) {
          if (env.co2 < equipment.targetValue) {
            env.co2 += effect;
          }
        } else {
          env.co2 += effect;
        }
        break;

      case 'led_panel':
        env.lightIntensity += effect;
        break;

      case 'irrigation':
        if (equipment.autoMode && equipment.targetValue !== undefined) {
          if (env.soilMoisture < equipment.targetValue) {
            env.soilMoisture += effect;
          }
        } else {
          env.soilMoisture += effect;
        }
        break;

      case 'nutrient_pump':
        if (equipment.autoMode && equipment.targetValue !== undefined) {
          // Adjust EC towards target
          const ecDiff = equipment.targetValue - env.ec;
          if (Math.abs(ecDiff) > 0.1) {
            env.ec += Math.sign(ecDiff) * effect;
          }
        }
        break;
    }

    // Calculate energy consumption for this tick
    const hourlyEnergy = equipment.powerConsumption * efficiencyMultiplier;
    return hourlyEnergy / 60; // Energy per tick (assuming 60 ticks per hour)
  }

  private updateSensorReadings(env: EnvironmentState): void {
    const environmentStore = useEnvironmentStore.getState();

    for (const sensor of environmentStore.sensors) {
      if (!sensor.isActive) continue;

      let value: number;
      switch (sensor.type) {
        case 'temperature':
          value = env.temperature;
          break;
        case 'humidity':
          value = env.humidity;
          break;
        case 'co2':
          value = env.co2;
          break;
        case 'light':
          value = env.lightIntensity;
          break;
        case 'soil':
          value = env.soilMoisture;
          break;
        case 'ph':
          value = env.ph;
          break;
        case 'ec':
          value = env.ec;
          break;
        default:
          continue;
      }

      // Add sensor noise based on accuracy
      const noise = (1 - sensor.accuracy / 100) * value * 0.05;
      const noisyValue = value + (Math.random() - 0.5) * noise;

      environmentStore.updateSensorReading(sensor.id, noisyValue);
    }
  }
}

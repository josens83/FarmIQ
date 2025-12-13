import { useCropStore } from '../../store/cropStore';
import { cropDefinitions } from '../../data/crops';
import type { GameTime, EnvironmentState, CropInstance, EnvironmentRange } from '../../types';

interface SystemContext {
  gameTime: GameTime;
  environment: EnvironmentState;
  crops: CropInstance[];
}

export class CropGrowthSystem {
  private readonly BASE_GROWTH_PER_TICK = 0.5; // Base growth percentage per tick

  update(context: SystemContext): void {
    const cropStore = useCropStore.getState();

    for (const crop of context.crops) {
      const definition = cropDefinitions[crop.cropId];
      if (!definition || crop.harvestable) continue;

      // Calculate growth rate based on environmental conditions
      const growthRate = this.calculateGrowthRate(crop, context.environment, definition);

      // Calculate stress factors
      const stress = this.calculateStress(context.environment, definition);

      // Update crop growth
      const newProgress = Math.min(100, crop.growthProgress + growthRate);
      cropStore.updateCropGrowth(crop.instanceId, newProgress);

      // Update stress factors
      cropStore.updateCropStress(crop.instanceId, stress);

      // Update health based on stress
      const totalStress = (stress.temperature + stress.water + stress.nutrient + stress.disease) / 4;
      const healthChange = totalStress > 50 ? -0.5 : 0.1; // Lose health if stressed, slowly recover if not
      const newHealth = Math.max(0, Math.min(100, crop.health + healthChange));
      cropStore.updateCropHealth(crop.instanceId, newHealth);

      // Update quality based on conditions
      const qualityChange = this.calculateQualityChange(context.environment, definition, totalStress);
      const newQuality = Math.max(0, Math.min(100, crop.quality + qualityChange));
      cropStore.updateCropQuality(crop.instanceId, newQuality);
    }
  }

  private calculateGrowthRate(
    crop: CropInstance,
    env: EnvironmentState,
    definition: typeof cropDefinitions[string]
  ): number {
    // Get condition scores (0-1)
    const tempScore = this.getConditionScore(env.temperature, definition.optimalConditions.temperature);
    const humidityScore = this.getConditionScore(env.humidity, definition.optimalConditions.humidity);
    const lightScore = this.getConditionScore(env.lightIntensity, definition.optimalConditions.light);
    const phScore = this.getConditionScore(env.ph, definition.optimalConditions.ph);
    const ecScore = this.getConditionScore(env.ec, definition.optimalConditions.ec);

    // Weighted average (temperature and light most important)
    const growthMultiplier =
      tempScore * 0.30 +
      lightScore * 0.25 +
      humidityScore * 0.20 +
      phScore * 0.15 +
      ecScore * 0.10;

    // Health affects growth rate
    const healthMultiplier = crop.health / 100;

    // Water affects growth
    const waterMultiplier = env.soilMoisture > 20 ? 1 : env.soilMoisture / 20;

    // Scale growth based on crop's total growth days
    const growthDaysMultiplier = 35 / definition.growthDays; // 35 days as baseline

    return this.BASE_GROWTH_PER_TICK *
      growthMultiplier *
      healthMultiplier *
      waterMultiplier *
      growthDaysMultiplier;
  }

  private getConditionScore(value: number, range: EnvironmentRange): number {
    if (value < range.min || value > range.max) {
      // Outside acceptable range - severe penalty
      const distanceFromRange = value < range.min
        ? range.min - value
        : value - range.max;
      const rangeSize = range.max - range.min;
      return Math.max(0, 1 - (distanceFromRange / rangeSize));
    }

    // Within range - calculate how close to optimal
    const distanceFromOptimal = Math.abs(value - range.optimal);
    const maxDistance = Math.max(range.optimal - range.min, range.max - range.optimal);
    return 1 - (distanceFromOptimal / maxDistance) * 0.3; // Max 30% penalty for being at edge of range
  }

  private calculateStress(
    env: EnvironmentState,
    definition: typeof cropDefinitions[string]
  ): CropInstance['stressFactors'] {
    // Temperature stress
    const tempScore = this.getConditionScore(env.temperature, definition.optimalConditions.temperature);
    const temperatureStress = (1 - tempScore) * 100;

    // Water stress
    const waterStress = env.soilMoisture < 30
      ? (30 - env.soilMoisture) * 2
      : env.soilMoisture > 80
        ? (env.soilMoisture - 80)
        : 0;

    // Nutrient stress (based on EC)
    const ecScore = this.getConditionScore(env.ec, definition.optimalConditions.ec);
    const nutrientStress = (1 - ecScore) * 80;

    // Disease risk increases with high humidity
    const diseaseStress = env.humidity > 85
      ? (env.humidity - 85) * 2
      : 0;

    return {
      temperature: Math.min(100, temperatureStress),
      water: Math.min(100, waterStress),
      nutrient: Math.min(100, nutrientStress),
      disease: Math.min(100, diseaseStress)
    };
  }

  private calculateQualityChange(
    env: EnvironmentState,
    definition: typeof cropDefinitions[string],
    totalStress: number
  ): number {
    // Quality improves when conditions are optimal, decreases when stressed
    const tempScore = this.getConditionScore(env.temperature, definition.optimalConditions.temperature);
    const lightScore = this.getConditionScore(env.lightIntensity, definition.optimalConditions.light);

    const optimalityScore = (tempScore + lightScore) / 2;

    if (optimalityScore > 0.8 && totalStress < 20) {
      return 0.2; // Improve quality when conditions are great
    } else if (totalStress > 50) {
      return -0.3; // Quality decreases when stressed
    }

    return 0; // No change
  }
}

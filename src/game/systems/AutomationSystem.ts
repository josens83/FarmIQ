import { useEquipmentStore } from '../../store/equipmentStore';
import type { GameTime, EnvironmentState, EquipmentInstance, AutomationRule } from '../../types';

interface SystemContext {
  gameTime: GameTime;
  environment: EnvironmentState;
  equipment: EquipmentInstance[];
  automationRules: AutomationRule[];
}

export class AutomationSystem {
  update(context: SystemContext): void {
    const equipmentStore = useEquipmentStore.getState();

    // Sort rules by priority (lower number = higher priority)
    const enabledRules = context.automationRules
      .filter((rule) => rule.isEnabled)
      .sort((a, b) => a.priority - b.priority);

    // Track which equipment has been modified this tick
    const modifiedEquipment = new Set<string>();

    for (const rule of enabledRules) {
      // Skip if equipment already modified by higher priority rule
      if (modifiedEquipment.has(rule.equipmentId)) continue;

      // Check if condition is met
      if (this.isConditionMet(rule, context.environment)) {
        // Execute action
        this.executeAction(rule, equipmentStore);
        modifiedEquipment.add(rule.equipmentId);
      }
    }
  }

  private isConditionMet(rule: AutomationRule, env: EnvironmentState): boolean {
    // Get current sensor value
    let currentValue: number;
    switch (rule.sensorType) {
      case 'temperature':
        currentValue = env.temperature;
        break;
      case 'humidity':
        currentValue = env.humidity;
        break;
      case 'co2':
        currentValue = env.co2;
        break;
      case 'light':
        currentValue = env.lightIntensity;
        break;
      case 'soil':
        currentValue = env.soilMoisture;
        break;
      case 'ph':
        currentValue = env.ph;
        break;
      case 'ec':
        currentValue = env.ec;
        break;
      default:
        return false;
    }

    // Check condition
    switch (rule.condition) {
      case 'above':
        return typeof rule.threshold === 'number' && currentValue > rule.threshold;
      case 'below':
        return typeof rule.threshold === 'number' && currentValue < rule.threshold;
      case 'between':
        if (Array.isArray(rule.threshold)) {
          const [min, max] = rule.threshold;
          return currentValue >= min && currentValue <= max;
        }
        return false;
      default:
        return false;
    }
  }

  private executeAction(
    rule: AutomationRule,
    equipmentStore: ReturnType<typeof useEquipmentStore.getState>
  ): void {
    switch (rule.action) {
      case 'activate':
        equipmentStore.setEquipmentActive(rule.equipmentId, true);
        break;
      case 'deactivate':
        equipmentStore.setEquipmentActive(rule.equipmentId, false);
        break;
      case 'setLevel':
        if (rule.actionValue !== undefined) {
          // This would require adding a setLevel method to equipment store
          // For now, just activate
          equipmentStore.setEquipmentActive(rule.equipmentId, true);
        }
        break;
    }
  }
}

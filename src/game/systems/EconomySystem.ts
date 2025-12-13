import { usePlayerStore } from '../../store/playerStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { useGameStore } from '../../store/gameStore';
import { equipmentDefinitions } from '../../data/equipment';
import { cropDefinitions } from '../../data/crops';
import type { GameTime, EquipmentInstance } from '../../types';

interface SystemContext {
  gameTime: GameTime;
  equipment: EquipmentInstance[];
  player: {
    money: number;
    level: number;
  };
}

export class EconomySystem {
  private readonly ENERGY_COST_PER_KWH = 0.12;
  private accumulatedEnergyCost = 0;
  private lastCostDeduction = 0;
  private readonly COST_DEDUCTION_INTERVAL = 60; // Deduct costs every 60 ticks (1 game hour)

  update(context: SystemContext): void {
    const playerStore = usePlayerStore.getState();
    const equipmentStore = useEquipmentStore.getState();
    const gameStore = useGameStore.getState();

    // Calculate energy costs for active equipment
    let tickEnergyCost = 0;
    for (const equipment of context.equipment) {
      if (!equipment.isActive) continue;

      const definition = equipmentDefinitions[equipment.definitionId];
      if (!definition) continue;

      // Calculate hourly cost and divide by ticks per hour
      const hourlyEnergy = equipment.powerConsumption * (equipment.efficiency / 100);
      const tickEnergy = hourlyEnergy / 60; // Assuming ~60 ticks per hour
      tickEnergyCost += tickEnergy * this.ENERGY_COST_PER_KWH;
    }

    // Accumulate costs
    this.accumulatedEnergyCost += tickEnergyCost;

    // Deduct accumulated costs periodically
    this.lastCostDeduction++;
    if (this.lastCostDeduction >= this.COST_DEDUCTION_INTERVAL) {
      if (this.accumulatedEnergyCost > 0.01) { // Only deduct if significant
        const canPay = playerStore.spendMoney(this.accumulatedEnergyCost);

        if (!canPay) {
          // Player can't afford energy costs - turn off equipment
          gameStore.addNotification({
            type: 'warning',
            title: '에너지 비용 부족',
            message: '자금이 부족하여 장비가 꺼졌습니다.'
          });

          // Turn off all equipment
          for (const equipment of context.equipment) {
            if (equipment.isActive) {
              equipmentStore.setEquipmentActive(equipment.id, false);
            }
          }
        } else {
          playerStore.recordExpense(this.accumulatedEnergyCost);
          playerStore.recordEnergyUsage(this.accumulatedEnergyCost / this.ENERGY_COST_PER_KWH);
        }
      }

      this.accumulatedEnergyCost = 0;
      this.lastCostDeduction = 0;
    }
  }

  // Calculate total hourly running cost
  static calculateHourlyCost(equipment: EquipmentInstance[]): number {
    let totalCost = 0;

    for (const eq of equipment) {
      if (!eq.isActive) continue;

      const definition = equipmentDefinitions[eq.definitionId];
      if (!definition) continue;

      const hourlyEnergy = eq.powerConsumption * (eq.efficiency / 100);
      totalCost += hourlyEnergy * 0.12; // Energy cost per kWh
    }

    return totalCost;
  }

  // Calculate daily running cost
  static calculateDailyCost(equipment: EquipmentInstance[]): number {
    return this.calculateHourlyCost(equipment) * 24;
  }

  // Estimate profit from crops
  static estimateHarvestRevenue(
    cropId: string,
    quality: number,
    health: number
  ): { revenue: number; yield: number } {
    const definition = cropDefinitions[cropId];
    if (!definition) return { revenue: 0, yield: 0 };

    const qualityMultiplier = quality >= 90 ? 1.5 :
                              quality >= 70 ? 1.2 :
                              quality >= 40 ? 1.0 : 0.6;

    const healthMultiplier = health / 100;
    const yieldAmount = definition.baseYield * healthMultiplier * qualityMultiplier;
    const priceMultiplier = quality >= 90 ? 1.5 :
                            quality >= 70 ? 1.2 :
                            quality >= 40 ? 1.0 : 0.7;

    const revenue = yieldAmount * definition.basePrice * priceMultiplier;

    return {
      revenue: Math.round(revenue * 100) / 100,
      yield: Math.round(yieldAmount * 100) / 100
    };
  }
}

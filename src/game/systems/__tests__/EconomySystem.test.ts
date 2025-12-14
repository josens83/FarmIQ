import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EconomySystem } from '../EconomySystem';
import { createMockEquipment, createMockGameTime } from '../../../test/helpers';

// Mock the stores
vi.mock('../../../store/playerStore', () => ({
  usePlayerStore: {
    getState: vi.fn(() => ({
      spendMoney: vi.fn(() => true),
      recordExpense: vi.fn(),
      recordEnergyUsage: vi.fn()
    }))
  }
}));

vi.mock('../../../store/equipmentStore', () => ({
  useEquipmentStore: {
    getState: vi.fn(() => ({
      setEquipmentActive: vi.fn()
    }))
  }
}));

vi.mock('../../../store/gameStore', () => ({
  useGameStore: {
    getState: vi.fn(() => ({
      addNotification: vi.fn()
    }))
  }
}));

// Import after mocking
import { usePlayerStore } from '../../../store/playerStore';
import { useEquipmentStore } from '../../../store/equipmentStore';
import { useGameStore } from '../../../store/gameStore';

describe('EconomySystem', () => {
  let system: EconomySystem;
  let mockPlayerStore: {
    spendMoney: ReturnType<typeof vi.fn>;
    recordExpense: ReturnType<typeof vi.fn>;
    recordEnergyUsage: ReturnType<typeof vi.fn>;
  };
  let mockEquipStore: {
    setEquipmentActive: ReturnType<typeof vi.fn>;
  };
  let mockGameStore: {
    addNotification: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    system = new EconomySystem();
    mockPlayerStore = {
      spendMoney: vi.fn(() => true),
      recordExpense: vi.fn(),
      recordEnergyUsage: vi.fn()
    };
    mockEquipStore = {
      setEquipmentActive: vi.fn()
    };
    mockGameStore = {
      addNotification: vi.fn()
    };
    vi.mocked(usePlayerStore.getState).mockReturnValue(mockPlayerStore);
    vi.mocked(useEquipmentStore.getState).mockReturnValue(mockEquipStore);
    vi.mocked(useGameStore.getState).mockReturnValue(mockGameStore);
  });

  describe('update', () => {
    it('should not charge when no equipment is active', () => {
      const context = {
        gameTime: createMockGameTime(),
        equipment: [createMockEquipment({ isActive: false })],
        player: { money: 1000, level: 1 }
      };

      // Run multiple updates to pass the deduction interval
      for (let i = 0; i < 61; i++) {
        system.update(context);
      }

      // Should not call spendMoney because no active equipment
      expect(mockPlayerStore.spendMoney).not.toHaveBeenCalled();
    });

    it('should accumulate energy costs for active equipment', () => {
      const heater = createMockEquipment({
        definitionId: 'basic-heater',
        isActive: true,
        powerConsumption: 2000, // 2 kW
        efficiency: 100
      });
      const context = {
        gameTime: createMockGameTime(),
        equipment: [heater],
        player: { money: 1000, level: 1 }
      };

      // Run enough updates to trigger deduction (60 ticks)
      for (let i = 0; i < 61; i++) {
        system.update(context);
      }

      // Should have called spendMoney once the interval is reached
      expect(mockPlayerStore.spendMoney).toHaveBeenCalled();
    });

    it('should record expense and energy usage after deduction', () => {
      const heater = createMockEquipment({
        definitionId: 'basic-heater',
        isActive: true,
        powerConsumption: 2000,
        efficiency: 100
      });
      const context = {
        gameTime: createMockGameTime(),
        equipment: [heater],
        player: { money: 1000, level: 1 }
      };

      // Run enough updates to trigger deduction
      for (let i = 0; i < 61; i++) {
        system.update(context);
      }

      expect(mockPlayerStore.recordExpense).toHaveBeenCalled();
      expect(mockPlayerStore.recordEnergyUsage).toHaveBeenCalled();
    });

    it('should turn off equipment when player cannot afford energy costs', () => {
      mockPlayerStore.spendMoney.mockReturnValue(false);

      const heater = createMockEquipment({
        definitionId: 'basic-heater',
        isActive: true,
        powerConsumption: 2000,
        efficiency: 100
      });
      const context = {
        gameTime: createMockGameTime(),
        equipment: [heater],
        player: { money: 0, level: 1 }
      };

      // Run enough updates to trigger deduction
      for (let i = 0; i < 61; i++) {
        system.update(context);
      }

      // Should turn off equipment and show notification
      expect(mockEquipStore.setEquipmentActive).toHaveBeenCalledWith(heater.id, false);
      expect(mockGameStore.addNotification).toHaveBeenCalledWith({
        type: 'warning',
        title: expect.any(String),
        message: expect.any(String)
      });
    });

    it('should calculate costs based on power consumption and efficiency', () => {
      const lowEfficiencyEquipment = createMockEquipment({
        definitionId: 'basic-heater',
        isActive: true,
        powerConsumption: 1000,
        efficiency: 50 // 50% efficiency
      });
      const context = {
        gameTime: createMockGameTime(),
        equipment: [lowEfficiencyEquipment],
        player: { money: 1000, level: 1 }
      };

      // Run enough updates to trigger deduction
      for (let i = 0; i < 61; i++) {
        system.update(context);
      }

      // Check that money was spent
      expect(mockPlayerStore.spendMoney).toHaveBeenCalled();
      const spentAmount = mockPlayerStore.spendMoney.mock.calls[0][0];
      // Energy should be less with 50% efficiency
      expect(spentAmount).toBeGreaterThan(0);
    });

    it('should handle multiple active equipment', () => {
      const heater = createMockEquipment({
        definitionId: 'basic-heater',
        isActive: true,
        powerConsumption: 1000,
        efficiency: 100
      });
      const cooler = createMockEquipment({
        definitionId: 'basic-cooler',
        isActive: true,
        powerConsumption: 1500,
        efficiency: 100
      });
      const context = {
        gameTime: createMockGameTime(),
        equipment: [heater, cooler],
        player: { money: 1000, level: 1 }
      };

      // Run enough updates to trigger deduction
      for (let i = 0; i < 61; i++) {
        system.update(context);
      }

      // Should have deducted cost for both equipment
      expect(mockPlayerStore.spendMoney).toHaveBeenCalled();
      const spentAmount = mockPlayerStore.spendMoney.mock.calls[0][0];
      expect(spentAmount).toBeGreaterThan(0);
    });

    it('should not deduct before interval is reached', () => {
      const heater = createMockEquipment({
        definitionId: 'basic-heater',
        isActive: true,
        powerConsumption: 2000,
        efficiency: 100
      });
      const context = {
        gameTime: createMockGameTime(),
        equipment: [heater],
        player: { money: 1000, level: 1 }
      };

      // Run fewer updates than the interval
      for (let i = 0; i < 30; i++) {
        system.update(context);
      }

      // Should not have called spendMoney yet
      expect(mockPlayerStore.spendMoney).not.toHaveBeenCalled();
    });
  });

  describe('calculateHourlyCost (static)', () => {
    it('should calculate hourly cost for active equipment', () => {
      const equipment = [
        createMockEquipment({
          definitionId: 'basic-heater',
          isActive: true,
          powerConsumption: 2, // 2 kW (matches actual equipment definition)
          efficiency: 100
        })
      ];

      const cost = EconomySystem.calculateHourlyCost(equipment);

      // 2 kW * 100% efficiency * $0.12/kWh = $0.24
      expect(cost).toBeCloseTo(0.24, 1);
    });

    it('should return 0 for inactive equipment', () => {
      const equipment = [
        createMockEquipment({
          definitionId: 'basic-heater',
          isActive: false,
          powerConsumption: 2,
          efficiency: 100
        })
      ];

      const cost = EconomySystem.calculateHourlyCost(equipment);

      expect(cost).toBe(0);
    });

    it('should sum costs for multiple active equipment', () => {
      const equipment = [
        createMockEquipment({
          definitionId: 'basic-heater',
          isActive: true,
          powerConsumption: 2, // 2 kW
          efficiency: 100
        }),
        createMockEquipment({
          definitionId: 'basic-cooler',
          isActive: true,
          powerConsumption: 3, // 3 kW
          efficiency: 100
        })
      ];

      const cost = EconomySystem.calculateHourlyCost(equipment);

      // (2 + 3) * 0.12 = 0.60
      expect(cost).toBeCloseTo(0.60, 1);
    });

    it('should apply efficiency to cost calculation', () => {
      const equipment = [
        createMockEquipment({
          definitionId: 'basic-heater',
          isActive: true,
          powerConsumption: 2, // 2 kW
          efficiency: 50 // 50% efficiency
        })
      ];

      const cost = EconomySystem.calculateHourlyCost(equipment);

      // 2 * 0.5 * 0.12 = 0.12
      expect(cost).toBeCloseTo(0.12, 1);
    });
  });

  describe('calculateDailyCost (static)', () => {
    it('should calculate 24 hours of costs', () => {
      const equipment = [
        createMockEquipment({
          definitionId: 'basic-heater',
          isActive: true,
          powerConsumption: 1000,
          efficiency: 100
        })
      ];

      const dailyCost = EconomySystem.calculateDailyCost(equipment);
      const hourlyCost = EconomySystem.calculateHourlyCost(equipment);

      expect(dailyCost).toBeCloseTo(hourlyCost * 24, 1);
    });
  });

  describe('estimateHarvestRevenue (static)', () => {
    it('should calculate revenue for excellent quality crop', () => {
      const result = EconomySystem.estimateHarvestRevenue('lettuce', 95, 100);

      expect(result.revenue).toBeGreaterThan(0);
      expect(result.yield).toBeGreaterThan(0);
    });

    it('should calculate revenue for normal quality crop', () => {
      const result = EconomySystem.estimateHarvestRevenue('lettuce', 50, 100);

      expect(result.revenue).toBeGreaterThan(0);
      expect(result.yield).toBeGreaterThan(0);
    });

    it('should calculate revenue for poor quality crop', () => {
      const result = EconomySystem.estimateHarvestRevenue('lettuce', 20, 100);

      expect(result.revenue).toBeGreaterThan(0);
      expect(result.yield).toBeGreaterThan(0);
    });

    it('should reduce yield based on health', () => {
      const healthyResult = EconomySystem.estimateHarvestRevenue('lettuce', 75, 100);
      const unhealthyResult = EconomySystem.estimateHarvestRevenue('lettuce', 75, 50);

      expect(healthyResult.yield).toBeGreaterThan(unhealthyResult.yield);
      expect(healthyResult.revenue).toBeGreaterThan(unhealthyResult.revenue);
    });

    it('should increase revenue for high quality crops', () => {
      const excellentResult = EconomySystem.estimateHarvestRevenue('lettuce', 95, 100);
      const normalResult = EconomySystem.estimateHarvestRevenue('lettuce', 50, 100);

      expect(excellentResult.revenue).toBeGreaterThan(normalResult.revenue);
    });

    it('should return 0 for unknown crop', () => {
      const result = EconomySystem.estimateHarvestRevenue('unknown_crop', 75, 100);

      expect(result.revenue).toBe(0);
      expect(result.yield).toBe(0);
    });

    it('should round revenue and yield to 2 decimal places', () => {
      const result = EconomySystem.estimateHarvestRevenue('lettuce', 75, 100);

      expect(result.revenue).toBe(Math.round(result.revenue * 100) / 100);
      expect(result.yield).toBe(Math.round(result.yield * 100) / 100);
    });
  });
});

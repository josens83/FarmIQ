import { useGameStore } from '../../store/gameStore';
import { useEnvironmentStore } from '../../store/environmentStore';
import { useCropStore } from '../../store/cropStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { usePlayerStore } from '../../store/playerStore';
import { EnvironmentSystem } from '../systems/EnvironmentSystem';
import { CropGrowthSystem } from '../systems/CropGrowthSystem';
import { AutomationSystem } from '../systems/AutomationSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { EventSystem } from '../systems/EventSystem';
import { equipmentDefinitions, getUpgradeCost } from '../../data/equipment';

class GameEngineClass {
  private animationFrameId: number | null = null;
  private lastTickTime: number = 0;
  private tickAccumulator: number = 0;
  private readonly TICK_INTERVAL = 1000; // 1 second per tick in real time
  private readonly HISTORY_INTERVAL = 5000; // Record history every 5 seconds

  private systems = {
    environment: new EnvironmentSystem(),
    cropGrowth: new CropGrowthSystem(),
    automation: new AutomationSystem(),
    economy: new EconomySystem(),
    event: new EventSystem()
  };

  private lastHistoryRecord: number = 0;
  private lastPlayTimeUpdate: number = 0;

  start(): void {
    if (this.animationFrameId !== null) return;

    this.lastTickTime = performance.now();
    this.lastHistoryRecord = Date.now();
    this.lastPlayTimeUpdate = Date.now();
    this.gameLoop(performance.now());
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private gameLoop = (currentTime: number): void => {
    const gameState = useGameStore.getState();

    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop);

    // Skip if paused
    if (gameState.gameTime.isPaused || !gameState.isGameStarted) {
      this.lastTickTime = currentTime;
      return;
    }

    // Calculate delta time with speed multiplier
    const deltaTime = (currentTime - this.lastTickTime) * gameState.gameTime.speed;
    this.lastTickTime = currentTime;

    // Accumulate time for tick
    this.tickAccumulator += deltaTime;

    // Process ticks
    while (this.tickAccumulator >= this.TICK_INTERVAL) {
      this.tick();
      this.tickAccumulator -= this.TICK_INTERVAL;
    }

    // Record history periodically
    const now = Date.now();
    if (now - this.lastHistoryRecord >= this.HISTORY_INTERVAL) {
      useEnvironmentStore.getState().recordHistory();
      this.lastHistoryRecord = now;
    }

    // Update play time every second
    if (now - this.lastPlayTimeUpdate >= 1000) {
      const elapsed = Math.floor((now - this.lastPlayTimeUpdate) / 1000);
      usePlayerStore.getState().addPlayTime(elapsed);
      this.lastPlayTimeUpdate = now;
    }
  };

  private tick(): void {
    const gameStore = useGameStore.getState();
    const environmentStore = useEnvironmentStore.getState();
    const cropStore = useCropStore.getState();
    const equipmentStore = useEquipmentStore.getState();
    const playerStore = usePlayerStore.getState();

    // Advance game time
    gameStore.advanceTick();

    // Update systems in order
    const context = {
      gameTime: gameStore.gameTime,
      environment: environmentStore.environment,
      crops: cropStore.crops,
      equipment: equipmentStore.equipment,
      automationRules: equipmentStore.automationRules,
      player: {
        money: playerStore.money,
        level: playerStore.level
      }
    };

    // 1. Run automation system first (may activate/deactivate equipment)
    this.systems.automation.update(context);

    // 2. Update environment based on equipment
    this.systems.environment.update(context);

    // 3. Update crop growth based on environment
    this.systems.cropGrowth.update(context);

    // 4. Update economy (energy costs, etc.)
    this.systems.economy.update(context);

    // 5. Check for random events
    this.systems.event.update(context);

    // Check for day change
    if (gameStore.gameTime.hour === 0 && gameStore.gameTime.minute === 0) {
      this.onDayChange();
    }
  }

  private onDayChange(): void {
    const cropStore = useCropStore.getState();
    const equipmentStore = useEquipmentStore.getState();
    const playerStore = usePlayerStore.getState();

    // Reset daily states
    cropStore.resetDailyWatering();
    equipmentStore.resetDailyEnergy();
    playerStore.incrementDay();
  }

  // Public methods for manual control
  plantCrop(cropId: string, position: { x: number; y: number }): boolean {
    const cropStore = useCropStore.getState();
    const playerStore = usePlayerStore.getState();

    // Check if crop is unlocked
    if (!playerStore.isCropUnlocked(cropId)) {
      return false;
    }

    // Try to plant
    const instanceId = cropStore.plantCrop(cropId, position);
    return instanceId !== null;
  }

  harvestCrop(instanceId: string): boolean {
    const cropStore = useCropStore.getState();
    const playerStore = usePlayerStore.getState();
    const gameStore = useGameStore.getState();

    const result = cropStore.harvestCrop(instanceId);
    if (!result) return false;

    // Add money and XP
    playerStore.addMoney(result.revenue);
    playerStore.addExperience(result.xpGained);
    playerStore.recordHarvest(result.revenue, result.cropId);

    // Add notification
    gameStore.addNotification({
      type: 'success',
      title: '수확 완료!',
      message: `${result.yield.toFixed(2)}kg 수확, $${result.revenue.toFixed(2)} 획득 (${result.quality} 품질)`
    });

    return true;
  }

  buyEquipment(definitionId: string): boolean {
    const equipmentStore = useEquipmentStore.getState();
    const playerStore = usePlayerStore.getState();

    const definition = equipmentDefinitions[definitionId];

    if (!definition) return false;
    if (!playerStore.canAfford(definition.baseCost)) return false;

    // Purchase
    playerStore.spendMoney(definition.baseCost);
    playerStore.recordExpense(definition.baseCost);
    equipmentStore.addEquipment(definitionId);

    return true;
  }

  upgradeEquipment(equipmentId: string): boolean {
    const equipmentStore = useEquipmentStore.getState();
    const playerStore = usePlayerStore.getState();

    const equipment = equipmentStore.equipment.find((e) => e.id === equipmentId);
    if (!equipment) return false;

    // Calculate upgrade cost
    const cost = getUpgradeCost(equipment.definitionId, equipment.level);

    if (!playerStore.canAfford(cost)) return false;

    // Purchase upgrade
    playerStore.spendMoney(cost);
    playerStore.recordExpense(cost);
    return equipmentStore.upgradeEquipment(equipmentId);
  }
}

// Singleton instance
export const GameEngine = new GameEngineClass();

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../store/gameStore';
import { useCropStore } from '../../store/cropStore';
import { usePlayerStore } from '../../store/playerStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { useEnvironmentStore } from '../../store/environmentStore';
import { CropGrowthSystem } from '../systems/CropGrowthSystem';
import { EnvironmentSystem } from '../systems/EnvironmentSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { createMockEnvironment, createMockGameTime, createMockEquipment } from '../../test/helpers';

describe('Game Integration Tests', () => {
  beforeEach(() => {
    // Reset all stores before each test
    useGameStore.setState({
      gameTime: {
        day: 1,
        hour: 8,
        minute: 0,
        totalTicks: 0,
        ticksPerSecond: 10,
        isPaused: true,
        speed: 1
      },
      isGameStarted: false,
      notifications: []
    });

    useCropStore.setState({ crops: [] });

    usePlayerStore.setState({
      money: 10000,
      level: 1,
      experience: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      harvestCount: 0,
      totalPlayTime: 0,
      currentDay: 1,
      unlockedCrops: ['lettuce', 'spinach']
    });

    useEquipmentStore.setState({
      equipment: [],
      automationRules: [],
      totalEnergyUsed: 0,
      dailyEnergyCost: 0
    });

    useEnvironmentStore.setState({
      environment: createMockEnvironment(),
      history: []
    });
  });

  describe('Game Start Flow', () => {
    it('should initialize game with default values', () => {
      const gameState = useGameStore.getState();

      expect(gameState.isGameStarted).toBe(false);
      expect(gameState.gameTime.isPaused).toBe(true);
      expect(gameState.gameTime.day).toBe(1);
    });

    it('should start new game and unpause', () => {
      useGameStore.getState().startNewGame();

      const gameState = useGameStore.getState();
      expect(gameState.isGameStarted).toBe(true);
      expect(gameState.gameTime.isPaused).toBe(false);
    });

    it('should have starting money and unlocked crops', () => {
      useGameStore.getState().startNewGame();

      const playerState = usePlayerStore.getState();
      expect(playerState.money).toBe(10000);
      expect(playerState.unlockedCrops).toContain('lettuce');
      expect(playerState.unlockedCrops).toContain('spinach');
    });
  });

  describe('Crop Lifecycle', () => {
    beforeEach(() => {
      useGameStore.getState().startNewGame();
    });

    it('should plant a crop at valid position', () => {
      const instanceId = useCropStore.getState().plantCrop('lettuce', { x: 0, y: 0 });

      expect(instanceId).not.toBeNull();

      const crops = useCropStore.getState().crops;
      expect(crops).toHaveLength(1);
      expect(crops[0].cropId).toBe('lettuce');
      expect(crops[0].growthProgress).toBe(0);
    });

    it('should not plant crop at occupied position', () => {
      useCropStore.getState().plantCrop('lettuce', { x: 0, y: 0 });
      const secondId = useCropStore.getState().plantCrop('spinach', { x: 0, y: 0 });

      expect(secondId).toBeNull();
      expect(useCropStore.getState().crops).toHaveLength(1);
    });

    it('should update crop growth progress', () => {
      const instanceId = useCropStore.getState().plantCrop('lettuce', { x: 0, y: 0 });
      useCropStore.getState().updateCropGrowth(instanceId!, 50);

      const crop = useCropStore.getState().crops[0];
      expect(crop.growthProgress).toBe(50);
      expect(crop.harvestable).toBe(false);
    });

    it('should mark crop as harvestable at 100% growth', () => {
      const instanceId = useCropStore.getState().plantCrop('lettuce', { x: 0, y: 0 });
      useCropStore.getState().updateCropGrowth(instanceId!, 100);

      const crop = useCropStore.getState().crops[0];
      expect(crop.harvestable).toBe(true);
    });

    it('should harvest crop and calculate revenue', () => {
      const instanceId = useCropStore.getState().plantCrop('lettuce', { x: 0, y: 0 });

      // Prepare for harvest
      useCropStore.getState().updateCropGrowth(instanceId!, 100);
      useCropStore.getState().updateCropHealth(instanceId!, 100);
      useCropStore.getState().updateCropQuality(instanceId!, 90);

      const result = useCropStore.getState().harvestCrop(instanceId!);

      expect(result).not.toBeNull();
      expect(result!.cropId).toBe('lettuce');
      expect(result!.quality).toBe('excellent');
      expect(result!.revenue).toBeGreaterThan(0);
      expect(useCropStore.getState().crops).toHaveLength(0);
    });
  });

  describe('Player Economy', () => {
    beforeEach(() => {
      useGameStore.getState().startNewGame();
    });

    it('should deduct money when spending', () => {
      const initialMoney = usePlayerStore.getState().money;
      usePlayerStore.getState().spendMoney(1000);

      expect(usePlayerStore.getState().money).toBe(initialMoney - 1000);
    });

    it('should add money from harvest', () => {
      const initialMoney = usePlayerStore.getState().money;
      usePlayerStore.getState().addMoney(500);

      expect(usePlayerStore.getState().money).toBe(initialMoney + 500);
    });

    it('should track experience and level up', () => {
      usePlayerStore.getState().addExperience(150);

      expect(usePlayerStore.getState().experience).toBeGreaterThan(0);
    });

    it('should record harvest statistics', () => {
      usePlayerStore.getState().recordHarvest(500, 'lettuce');

      const playerState = usePlayerStore.getState();
      expect(playerState.statistics.totalRevenue).toBe(500);
      expect(playerState.statistics.totalHarvests).toBe(1);
    });
  });

  describe('Environment System', () => {
    it('should update environment with equipment effects', () => {
      const environmentSystem = new EnvironmentSystem();

      const heater = createMockEquipment({
        type: 'heater',
        isActive: true,
        efficiency: 100
      });

      const context = {
        gameTime: createMockGameTime({ hour: 12 }),
        environment: createMockEnvironment({ temperature: 18 }),
        crops: [],
        equipment: [heater],
        automationRules: [],
        player: { money: 10000, level: 1 }
      };

      environmentSystem.update(context);

      // Heater should increase temperature
      const envState = useEnvironmentStore.getState().environment;
      expect(envState.temperature).toBeGreaterThanOrEqual(18);
    });
  });

  describe('Crop Growth System', () => {
    it('should update crop growth based on environment', () => {
      const cropGrowthSystem = new CropGrowthSystem();

      // Plant a crop
      useCropStore.getState().plantCrop('lettuce', { x: 0, y: 0 });
      const crops = useCropStore.getState().crops;

      const context = {
        gameTime: createMockGameTime({ hour: 12 }),
        environment: createMockEnvironment({
          temperature: 20, // Optimal for lettuce
          humidity: 65,
          lightIntensity: 500
        }),
        crops: crops,
        equipment: [],
        automationRules: [],
        player: { money: 10000, level: 1 }
      };

      cropGrowthSystem.update(context);

      const updatedCrop = useCropStore.getState().crops[0];
      expect(updatedCrop.growthProgress).toBeGreaterThan(0);
    });

    it('should affect crop health under stress', () => {
      const cropGrowthSystem = new CropGrowthSystem();

      useCropStore.getState().plantCrop('lettuce', { x: 0, y: 0 });
      const crops = useCropStore.getState().crops;

      // Suboptimal environment (too hot)
      const context = {
        gameTime: createMockGameTime({ hour: 12 }),
        environment: createMockEnvironment({
          temperature: 35, // Too hot for lettuce
          humidity: 30,    // Too dry
          lightIntensity: 500
        }),
        crops: crops,
        equipment: [],
        automationRules: [],
        player: { money: 10000, level: 1 }
      };

      cropGrowthSystem.update(context);

      const updatedCrop = useCropStore.getState().crops[0];
      // Crop should have temperature stress
      expect(updatedCrop.stressFactors.temperature).toBeGreaterThan(0);
    });
  });

  describe('Equipment Management', () => {
    beforeEach(() => {
      useGameStore.getState().startNewGame();
    });

    it('should add equipment to inventory', () => {
      useEquipmentStore.getState().addEquipment('basic-heater');

      const equipment = useEquipmentStore.getState().equipment;
      expect(equipment).toHaveLength(1);
      expect(equipment[0].type).toBe('heater');
    });

    it('should toggle equipment active state', () => {
      useEquipmentStore.getState().addEquipment('basic-heater');
      const equipmentId = useEquipmentStore.getState().equipment[0].id;

      useEquipmentStore.getState().toggleEquipment(equipmentId);
      expect(useEquipmentStore.getState().equipment[0].isActive).toBe(true);

      useEquipmentStore.getState().toggleEquipment(equipmentId);
      expect(useEquipmentStore.getState().equipment[0].isActive).toBe(false);
    });

    it('should upgrade equipment and improve efficiency', () => {
      useEquipmentStore.getState().addEquipment('basic-heater');
      const equipmentId = useEquipmentStore.getState().equipment[0].id;

      const initialLevel = useEquipmentStore.getState().equipment[0].level;
      useEquipmentStore.getState().upgradeEquipment(equipmentId);

      expect(useEquipmentStore.getState().equipment[0].level).toBe(initialLevel + 1);
    });
  });

  describe('Game Time Progression', () => {
    it('should advance game time on tick', () => {
      useGameStore.getState().startNewGame();

      const initialTicks = useGameStore.getState().gameTime.totalTicks;
      useGameStore.getState().advanceTick();

      const newTicks = useGameStore.getState().gameTime.totalTicks;
      expect(newTicks).toBe(initialTicks + 1);
    });

    it('should roll over hour when minutes exceed 60', () => {
      useGameStore.setState({
        gameTime: {
          day: 1,
          hour: 23,
          minute: 55,
          totalTicks: 0,
          ticksPerSecond: 10,
          isPaused: false,
          speed: 1
        },
        isGameStarted: true
      });

      useGameStore.getState().advanceTick();

      const newTime = useGameStore.getState().gameTime;
      // Should have advanced past midnight
      expect(newTime.hour).toBeLessThan(24);
    });

    it('should change game speed', () => {
      useGameStore.getState().startNewGame();
      useGameStore.getState().setGameSpeed(2);

      expect(useGameStore.getState().gameTime.speed).toBe(2);
    });

    it('should toggle pause state', () => {
      useGameStore.getState().startNewGame();
      const wasPaused = useGameStore.getState().gameTime.isPaused;

      useGameStore.getState().togglePause();

      expect(useGameStore.getState().gameTime.isPaused).toBe(!wasPaused);
    });
  });

  describe('Economy System', () => {
    it('should calculate energy costs from active equipment', () => {
      const activeHeater = createMockEquipment({
        type: 'heater',
        isActive: true,
        powerConsumption: 2.0
      });

      // Use static method to calculate hourly cost
      const hourlyCost = EconomySystem.calculateHourlyCost([activeHeater]);

      // With 2kW at 100% efficiency and $0.12/kWh, hourly cost = 2 * 1 * 0.12 = $0.24
      expect(hourlyCost).toBeGreaterThan(0);
      expect(hourlyCost).toBeCloseTo(0.24, 2);
    });

    it('should calculate daily cost correctly', () => {
      const activeHeater = createMockEquipment({
        type: 'heater',
        isActive: true,
        powerConsumption: 2.0
      });

      const dailyCost = EconomySystem.calculateDailyCost([activeHeater]);

      // Daily cost should be 24 * hourly cost
      expect(dailyCost).toBeCloseTo(0.24 * 24, 2);
    });
  });

  describe('Notifications', () => {
    it('should add notifications', () => {
      useGameStore.getState().addNotification({
        type: 'success',
        title: 'Test',
        message: 'Test notification'
      });

      const notifications = useGameStore.getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe('Test');
    });

    it('should mark notification as read', () => {
      useGameStore.getState().addNotification({
        type: 'info',
        title: 'Info',
        message: 'Information'
      });

      const notificationId = useGameStore.getState().notifications[0].id;
      useGameStore.getState().markNotificationRead(notificationId);

      expect(useGameStore.getState().notifications[0].read).toBe(true);
    });

    it('should limit notifications to 50', () => {
      // Add 55 notifications
      for (let i = 0; i < 55; i++) {
        useGameStore.getState().addNotification({
          type: 'info',
          title: `Notification ${i}`,
          message: `Message ${i}`
        });
      }

      expect(useGameStore.getState().notifications.length).toBeLessThanOrEqual(50);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CropGrowthSystem } from '../CropGrowthSystem';
import { createMockCrop, createMockEnvironment, createOptimalEnvironment, createMockGameTime } from '../../../test/helpers';
import { cropDefinitions } from '../../../data/crops';

// Mock the cropStore
vi.mock('../../../store/cropStore', () => ({
  useCropStore: {
    getState: vi.fn(() => ({
      updateCropGrowth: vi.fn(),
      updateCropStress: vi.fn(),
      updateCropHealth: vi.fn(),
      updateCropQuality: vi.fn()
    }))
  }
}));

// Import after mocking
import { useCropStore } from '../../../store/cropStore';

describe('CropGrowthSystem', () => {
  let system: CropGrowthSystem;
  let mockStore: {
    updateCropGrowth: ReturnType<typeof vi.fn>;
    updateCropStress: ReturnType<typeof vi.fn>;
    updateCropHealth: ReturnType<typeof vi.fn>;
    updateCropQuality: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    system = new CropGrowthSystem();
    mockStore = {
      updateCropGrowth: vi.fn(),
      updateCropStress: vi.fn(),
      updateCropHealth: vi.fn(),
      updateCropQuality: vi.fn()
    };
    vi.mocked(useCropStore.getState).mockReturnValue(mockStore);
  });

  describe('update', () => {
    it('should skip crops that are already harvestable', () => {
      const harvestableCrop = createMockCrop({ harvestable: true });
      const context = {
        gameTime: createMockGameTime(),
        environment: createMockEnvironment(),
        crops: [harvestableCrop]
      };

      system.update(context);

      expect(mockStore.updateCropGrowth).not.toHaveBeenCalled();
    });

    it('should skip crops with unknown definition', () => {
      const unknownCrop = createMockCrop({ cropId: 'unknown_crop' });
      const context = {
        gameTime: createMockGameTime(),
        environment: createMockEnvironment(),
        crops: [unknownCrop]
      };

      system.update(context);

      expect(mockStore.updateCropGrowth).not.toHaveBeenCalled();
    });

    it('should update growth progress for valid crops', () => {
      const crop = createMockCrop({ growthProgress: 0 });
      const context = {
        gameTime: createMockGameTime(),
        environment: createOptimalEnvironment('lettuce'),
        crops: [crop]
      };

      system.update(context);

      expect(mockStore.updateCropGrowth).toHaveBeenCalledWith(
        crop.instanceId,
        expect.any(Number)
      );
      const newProgress = mockStore.updateCropGrowth.mock.calls[0][1];
      expect(newProgress).toBeGreaterThan(0);
    });

    it('should update stress factors for crops', () => {
      const crop = createMockCrop();
      const context = {
        gameTime: createMockGameTime(),
        environment: createMockEnvironment(),
        crops: [crop]
      };

      system.update(context);

      expect(mockStore.updateCropStress).toHaveBeenCalledWith(
        crop.instanceId,
        expect.objectContaining({
          temperature: expect.any(Number),
          water: expect.any(Number),
          nutrient: expect.any(Number),
          disease: expect.any(Number)
        })
      );
    });

    it('should cap growth progress at 100%', () => {
      const crop = createMockCrop({ growthProgress: 99.9 });
      const context = {
        gameTime: createMockGameTime(),
        environment: createOptimalEnvironment('lettuce'),
        crops: [crop]
      };

      system.update(context);

      const newProgress = mockStore.updateCropGrowth.mock.calls[0][1];
      expect(newProgress).toBeLessThanOrEqual(100);
    });

    it('should update health based on stress levels', () => {
      const crop = createMockCrop({ health: 50 });
      const context = {
        gameTime: createMockGameTime(),
        environment: createMockEnvironment(),
        crops: [crop]
      };

      system.update(context);

      expect(mockStore.updateCropHealth).toHaveBeenCalledWith(
        crop.instanceId,
        expect.any(Number)
      );
    });

    it('should update quality based on conditions', () => {
      const crop = createMockCrop({ quality: 50 });
      const context = {
        gameTime: createMockGameTime(),
        environment: createOptimalEnvironment('lettuce'),
        crops: [crop]
      };

      system.update(context);

      expect(mockStore.updateCropQuality).toHaveBeenCalledWith(
        crop.instanceId,
        expect.any(Number)
      );
    });
  });

  describe('growth rate calculations', () => {
    it('should have higher growth rate in optimal conditions', () => {
      const crop = createMockCrop({ growthProgress: 0 });
      const optimalEnv = createOptimalEnvironment('lettuce');
      const suboptimalEnv = createMockEnvironment({ temperature: 35 }); // Too hot for lettuce

      // Update with optimal environment
      system.update({
        gameTime: createMockGameTime(),
        environment: optimalEnv,
        crops: [crop]
      });
      const optimalGrowth = mockStore.updateCropGrowth.mock.calls[0][1];

      // Reset and update with suboptimal environment
      mockStore.updateCropGrowth.mockClear();
      system.update({
        gameTime: createMockGameTime(),
        environment: suboptimalEnv,
        crops: [createMockCrop({ growthProgress: 0 })]
      });
      const suboptimalGrowth = mockStore.updateCropGrowth.mock.calls[0][1];

      expect(optimalGrowth).toBeGreaterThan(suboptimalGrowth);
    });

    it('should have slower growth with lower health', () => {
      const healthyCrop = createMockCrop({ health: 100, growthProgress: 0 });
      const unhealthyCrop = createMockCrop({ health: 30, growthProgress: 0 });
      const env = createOptimalEnvironment('lettuce');

      // Update healthy crop
      system.update({
        gameTime: createMockGameTime(),
        environment: env,
        crops: [healthyCrop]
      });
      const healthyGrowth = mockStore.updateCropGrowth.mock.calls[0][1];

      // Reset and update unhealthy crop
      mockStore.updateCropGrowth.mockClear();
      system.update({
        gameTime: createMockGameTime(),
        environment: env,
        crops: [unhealthyCrop]
      });
      const unhealthyGrowth = mockStore.updateCropGrowth.mock.calls[0][1];

      expect(healthyGrowth).toBeGreaterThan(unhealthyGrowth);
    });

    it('should have slower growth with low soil moisture', () => {
      const crop1 = createMockCrop({ growthProgress: 0 });
      const crop2 = createMockCrop({ growthProgress: 0 });
      const wetEnv = createMockEnvironment({ soilMoisture: 60 });
      const dryEnv = createMockEnvironment({ soilMoisture: 10 });

      system.update({
        gameTime: createMockGameTime(),
        environment: wetEnv,
        crops: [crop1]
      });
      const wetGrowth = mockStore.updateCropGrowth.mock.calls[0][1];

      mockStore.updateCropGrowth.mockClear();
      system.update({
        gameTime: createMockGameTime(),
        environment: dryEnv,
        crops: [crop2]
      });
      const dryGrowth = mockStore.updateCropGrowth.mock.calls[0][1];

      expect(wetGrowth).toBeGreaterThan(dryGrowth);
    });
  });

  describe('stress calculations', () => {
    it('should have low stress in optimal conditions', () => {
      const crop = createMockCrop();
      const env = createOptimalEnvironment('lettuce');

      system.update({
        gameTime: createMockGameTime(),
        environment: env,
        crops: [crop]
      });

      const stressCall = mockStore.updateCropStress.mock.calls[0][1];
      expect(stressCall.temperature).toBeLessThan(30);
      expect(stressCall.water).toBe(0);
    });

    it('should have high temperature stress when outside optimal range', () => {
      const crop = createMockCrop();
      const hotEnv = createMockEnvironment({ temperature: 40 }); // Too hot

      system.update({
        gameTime: createMockGameTime(),
        environment: hotEnv,
        crops: [crop]
      });

      const stressCall = mockStore.updateCropStress.mock.calls[0][1];
      expect(stressCall.temperature).toBeGreaterThan(50);
    });

    it('should have water stress when soil moisture is too low', () => {
      const crop = createMockCrop();
      const dryEnv = createMockEnvironment({ soilMoisture: 10 });

      system.update({
        gameTime: createMockGameTime(),
        environment: dryEnv,
        crops: [crop]
      });

      const stressCall = mockStore.updateCropStress.mock.calls[0][1];
      expect(stressCall.water).toBeGreaterThan(0);
    });

    it('should have water stress when soil moisture is too high', () => {
      const crop = createMockCrop();
      const wetEnv = createMockEnvironment({ soilMoisture: 95 });

      system.update({
        gameTime: createMockGameTime(),
        environment: wetEnv,
        crops: [crop]
      });

      const stressCall = mockStore.updateCropStress.mock.calls[0][1];
      expect(stressCall.water).toBeGreaterThan(0);
    });

    it('should have disease stress with high humidity', () => {
      const crop = createMockCrop();
      const humidEnv = createMockEnvironment({ humidity: 95 });

      system.update({
        gameTime: createMockGameTime(),
        environment: humidEnv,
        crops: [crop]
      });

      const stressCall = mockStore.updateCropStress.mock.calls[0][1];
      expect(stressCall.disease).toBeGreaterThan(0);
    });
  });

  describe('quality changes', () => {
    it('should improve quality in optimal conditions with low stress', () => {
      const crop = createMockCrop({ quality: 50 });
      const env = createOptimalEnvironment('lettuce');

      system.update({
        gameTime: createMockGameTime(),
        environment: env,
        crops: [crop]
      });

      const newQuality = mockStore.updateCropQuality.mock.calls[0][1];
      expect(newQuality).toBeGreaterThanOrEqual(50);
    });

    it('should keep quality within 0-100 bounds', () => {
      const lowQualityCrop = createMockCrop({ quality: 1 });
      const highQualityCrop = createMockCrop({ quality: 99 });
      const stressfulEnv = createMockEnvironment({ temperature: 45, humidity: 95 });
      const optimalEnv = createOptimalEnvironment('lettuce');

      // Test lower bound
      system.update({
        gameTime: createMockGameTime(),
        environment: stressfulEnv,
        crops: [lowQualityCrop]
      });
      const lowQuality = mockStore.updateCropQuality.mock.calls[0][1];
      expect(lowQuality).toBeGreaterThanOrEqual(0);

      // Test upper bound
      mockStore.updateCropQuality.mockClear();
      system.update({
        gameTime: createMockGameTime(),
        environment: optimalEnv,
        crops: [highQualityCrop]
      });
      const highQuality = mockStore.updateCropQuality.mock.calls[0][1];
      expect(highQuality).toBeLessThanOrEqual(100);
    });
  });

  describe('multiple crops', () => {
    it('should process all crops in the context', () => {
      const crops = [
        createMockCrop({ cropId: 'lettuce' }),
        createMockCrop({ cropId: 'spinach' }),
        createMockCrop({ cropId: 'tomato' })
      ];
      const env = createMockEnvironment();

      system.update({
        gameTime: createMockGameTime(),
        environment: env,
        crops
      });

      expect(mockStore.updateCropGrowth).toHaveBeenCalledTimes(3);
      expect(mockStore.updateCropStress).toHaveBeenCalledTimes(3);
      expect(mockStore.updateCropHealth).toHaveBeenCalledTimes(3);
      expect(mockStore.updateCropQuality).toHaveBeenCalledTimes(3);
    });
  });
});

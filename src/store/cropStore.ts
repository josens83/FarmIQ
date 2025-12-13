import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CropInstance, HarvestResult, HarvestQuality } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { cropDefinitions } from '../data/crops';

interface CropStore {
  crops: CropInstance[];

  // Crop Management
  plantCrop: (cropId: string, position: { x: number; y: number }) => string | null;
  removeCrop: (instanceId: string) => void;
  harvestCrop: (instanceId: string) => HarvestResult | null;

  // Growth Updates
  updateCropGrowth: (instanceId: string, progress: number) => void;
  updateCropHealth: (instanceId: string, health: number) => void;
  updateCropQuality: (instanceId: string, quality: number) => void;
  updateCropStress: (instanceId: string, stress: Partial<CropInstance['stressFactors']>) => void;
  waterCrop: (instanceId: string) => void;
  resetDailyWatering: () => void;

  // Batch Operations
  updateAllCrops: (updater: (crop: CropInstance) => CropInstance) => void;

  // Queries
  getCropAt: (position: { x: number; y: number }) => CropInstance | undefined;
  getHarvestableCrops: () => CropInstance[];

  // Reset
  resetCrops: () => void;
}

export const useCropStore = create<CropStore>()(
  persist(
    (set, get) => ({
      crops: [],

      plantCrop: (cropId, position) => {
        const existingCrop = get().getCropAt(position);
        if (existingCrop) return null;

        const definition = cropDefinitions[cropId];
        if (!definition) return null;

        const instanceId = uuidv4();
        const newCrop: CropInstance = {
          instanceId,
          cropId,
          position,
          plantedAt: Date.now(),
          currentStage: 0,
          growthProgress: 0,
          health: 100,
          quality: 50,
          stressFactors: {
            temperature: 0,
            water: 0,
            nutrient: 0,
            disease: 0
          },
          harvestable: false,
          wateredToday: false
        };

        set((state) => ({ crops: [...state.crops, newCrop] }));
        return instanceId;
      },

      removeCrop: (instanceId) => set((state) => ({
        crops: state.crops.filter((c) => c.instanceId !== instanceId)
      })),

      harvestCrop: (instanceId) => {
        const crop = get().crops.find((c) => c.instanceId === instanceId);
        if (!crop || !crop.harvestable) return null;

        const definition = cropDefinitions[crop.cropId];
        if (!definition) return null;

        // Calculate quality grade
        let qualityGrade: HarvestQuality;
        if (crop.quality >= 90) qualityGrade = 'excellent';
        else if (crop.quality >= 70) qualityGrade = 'good';
        else if (crop.quality >= 40) qualityGrade = 'normal';
        else qualityGrade = 'poor';

        // Calculate yield based on health and quality
        const healthMultiplier = crop.health / 100;
        const qualityMultiplier =
          qualityGrade === 'excellent' ? 1.5 :
          qualityGrade === 'good' ? 1.2 :
          qualityGrade === 'normal' ? 1.0 : 0.6;

        const yieldAmount = definition.baseYield * healthMultiplier * qualityMultiplier;
        const priceMultiplier =
          qualityGrade === 'excellent' ? 1.5 :
          qualityGrade === 'good' ? 1.2 :
          qualityGrade === 'normal' ? 1.0 : 0.7;

        const revenue = yieldAmount * definition.basePrice * priceMultiplier;
        const xpGained = Math.floor(
          definition.difficulty * 10 * qualityMultiplier * healthMultiplier
        );

        const result: HarvestResult = {
          cropId: crop.cropId,
          instanceId,
          yield: Math.round(yieldAmount * 100) / 100,
          quality: qualityGrade,
          revenue: Math.round(revenue * 100) / 100,
          xpGained
        };

        // Remove harvested crop
        set((state) => ({
          crops: state.crops.filter((c) => c.instanceId !== instanceId)
        }));

        return result;
      },

      updateCropGrowth: (instanceId, progress) => set((state) => ({
        crops: state.crops.map((c) => {
          if (c.instanceId !== instanceId) return c;

          const definition = cropDefinitions[c.cropId];
          if (!definition) return c;

          const newProgress = Math.min(100, progress);

          // Calculate current stage based on progress
          let currentStage = 0;
          let progressThreshold = 0;
          for (let i = 0; i < definition.stages.length; i++) {
            const stageProgress = (definition.stages[i].daysRequired / definition.growthDays) * 100;
            if (newProgress >= progressThreshold + stageProgress) {
              currentStage = i;
              progressThreshold += stageProgress;
            } else {
              break;
            }
          }

          return {
            ...c,
            growthProgress: newProgress,
            currentStage,
            harvestable: newProgress >= 100
          };
        })
      })),

      updateCropHealth: (instanceId, health) => set((state) => ({
        crops: state.crops.map((c) =>
          c.instanceId === instanceId
            ? { ...c, health: Math.max(0, Math.min(100, health)) }
            : c
        )
      })),

      updateCropQuality: (instanceId, quality) => set((state) => ({
        crops: state.crops.map((c) =>
          c.instanceId === instanceId
            ? { ...c, quality: Math.max(0, Math.min(100, quality)) }
            : c
        )
      })),

      updateCropStress: (instanceId, stress) => set((state) => ({
        crops: state.crops.map((c) =>
          c.instanceId === instanceId
            ? { ...c, stressFactors: { ...c.stressFactors, ...stress } }
            : c
        )
      })),

      waterCrop: (instanceId) => set((state) => ({
        crops: state.crops.map((c) =>
          c.instanceId === instanceId
            ? { ...c, wateredToday: true }
            : c
        )
      })),

      resetDailyWatering: () => set((state) => ({
        crops: state.crops.map((c) => ({ ...c, wateredToday: false }))
      })),

      updateAllCrops: (updater) => set((state) => ({
        crops: state.crops.map(updater)
      })),

      getCropAt: (position) =>
        get().crops.find(
          (c) => c.position.x === position.x && c.position.y === position.y
        ),

      getHarvestableCrops: () =>
        get().crops.filter((c) => c.harvestable),

      resetCrops: () => set({ crops: [] })
    }),
    {
      name: 'farmiq-crop-store',
      partialize: (state) => ({
        crops: state.crops
      })
    }
  )
);

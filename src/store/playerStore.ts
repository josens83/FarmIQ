import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerState, GameStatistics, PlayerSettings } from '../types';
import { levelThresholds } from '../data/config/levels';

interface PlayerStore extends PlayerState {
  // Money Management
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;

  // Experience & Level
  addExperience: (xp: number) => void;

  // Unlocks
  unlockCrop: (cropId: string) => void;
  unlockEquipment: (equipmentId: string) => void;
  unlockTechNode: (nodeId: string) => void;
  addAchievement: (achievementId: string) => void;

  // Statistics Updates
  recordHarvest: (revenue: number, cropId: string) => void;
  recordExpense: (amount: number) => void;
  recordEnergyUsage: (kwh: number) => void;
  addPlayTime: (seconds: number) => void;
  incrementDay: () => void;

  // Settings
  updateSettings: (settings: Partial<PlayerSettings>) => void;

  // Queries
  canAfford: (amount: number) => boolean;
  isCropUnlocked: (cropId: string) => boolean;
  isEquipmentUnlocked: (equipmentId: string) => boolean;
  isTechUnlocked: (nodeId: string) => boolean;
  hasAchievement: (achievementId: string) => boolean;

  // Reset
  resetPlayer: () => void;
}

const initialStatistics: GameStatistics = {
  totalHarvests: 0,
  totalRevenue: 0,
  totalExpenses: 0,
  totalEnergyUsed: 0,
  cropsGrown: {},
  playTime: 0,
  daysPlayed: 1,
  bestQualityHarvest: 0,
  perfectHarvests: 0
};

const initialSettings: PlayerSettings = {
  soundEnabled: true,
  musicEnabled: true,
  notificationsEnabled: true,
  language: 'ko',
  showTutorial: true,
  autoSaveEnabled: true
};

const initialPlayerState: PlayerState = {
  money: 10000,
  experience: 0,
  level: 1,
  unlockedCrops: ['lettuce', 'spinach'],
  unlockedEquipment: ['basic-heater', 'basic-cooler', 'basic-fan'],
  techTree: {},
  achievements: [],
  statistics: initialStatistics,
  settings: initialSettings
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...initialPlayerState,

      addMoney: (amount) => set((state) => ({
        money: state.money + amount
      })),

      spendMoney: (amount) => {
        if (!get().canAfford(amount)) return false;
        set((state) => ({ money: state.money - amount }));
        return true;
      },

      addExperience: (xp) => set((state) => {
        const newExperience = state.experience + xp;

        // Check for level up
        let newLevel = state.level;
        for (const threshold of levelThresholds) {
          if (newExperience >= threshold.xpRequired && threshold.level > newLevel) {
            newLevel = threshold.level;
          }
        }

        return {
          experience: newExperience,
          level: newLevel
        };
      }),

      unlockCrop: (cropId) => set((state) => ({
        unlockedCrops: state.unlockedCrops.includes(cropId)
          ? state.unlockedCrops
          : [...state.unlockedCrops, cropId]
      })),

      unlockEquipment: (equipmentId) => set((state) => ({
        unlockedEquipment: state.unlockedEquipment.includes(equipmentId)
          ? state.unlockedEquipment
          : [...state.unlockedEquipment, equipmentId]
      })),

      unlockTechNode: (nodeId) => set((state) => ({
        techTree: { ...state.techTree, [nodeId]: true }
      })),

      addAchievement: (achievementId) => set((state) => ({
        achievements: state.achievements.includes(achievementId)
          ? state.achievements
          : [...state.achievements, achievementId]
      })),

      recordHarvest: (revenue, cropId) => set((state) => ({
        statistics: {
          ...state.statistics,
          totalHarvests: state.statistics.totalHarvests + 1,
          totalRevenue: state.statistics.totalRevenue + revenue,
          cropsGrown: {
            ...state.statistics.cropsGrown,
            [cropId]: (state.statistics.cropsGrown[cropId] || 0) + 1
          }
        }
      })),

      recordExpense: (amount) => set((state) => ({
        statistics: {
          ...state.statistics,
          totalExpenses: state.statistics.totalExpenses + amount
        }
      })),

      recordEnergyUsage: (kwh) => set((state) => ({
        statistics: {
          ...state.statistics,
          totalEnergyUsed: state.statistics.totalEnergyUsed + kwh
        }
      })),

      addPlayTime: (seconds) => set((state) => ({
        statistics: {
          ...state.statistics,
          playTime: state.statistics.playTime + seconds
        }
      })),

      incrementDay: () => set((state) => ({
        statistics: {
          ...state.statistics,
          daysPlayed: state.statistics.daysPlayed + 1
        }
      })),

      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),

      canAfford: (amount) => get().money >= amount,

      isCropUnlocked: (cropId) => get().unlockedCrops.includes(cropId),

      isEquipmentUnlocked: (equipmentId) => get().unlockedEquipment.includes(equipmentId),

      isTechUnlocked: (nodeId) => get().techTree[nodeId] === true,

      hasAchievement: (achievementId) => get().achievements.includes(achievementId),

      resetPlayer: () => set(initialPlayerState)
    }),
    {
      name: 'farmiq-player-store',
      partialize: (state) => ({
        money: state.money,
        experience: state.experience,
        level: state.level,
        unlockedCrops: state.unlockedCrops,
        unlockedEquipment: state.unlockedEquipment,
        techTree: state.techTree,
        achievements: state.achievements,
        statistics: state.statistics,
        settings: state.settings
      })
    }
  )
);

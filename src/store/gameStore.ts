import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameTime, GameSpeed, GameConfig, TutorialProgress, GameNotification } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface GameStore {
  // Game Time
  gameTime: GameTime;
  setGameSpeed: (speed: GameSpeed) => void;
  togglePause: () => void;
  advanceTick: () => void;

  // Game Config
  config: GameConfig;

  // Tutorial
  tutorialProgress: TutorialProgress;
  advanceTutorial: () => void;
  skipTutorial: () => void;

  // Notifications
  notifications: GameNotification[];
  addNotification: (notification: Omit<GameNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Game State
  isGameStarted: boolean;
  startNewGame: () => void;
  resetGame: () => void;
}

const defaultConfig: GameConfig = {
  baseTickRate: 10,
  startingMoney: 10000,
  startingCrops: ['lettuce', 'spinach'],
  startingEquipment: ['heater-1', 'cooler-1', 'fan-1'],
  energyCostPerKwh: 0.12,
  waterCostPerLiter: 0.002,
  farmGridSize: { width: 8, height: 6 },
  maxAutomationRules: 10,
  eventProbabilityBase: 0.01
};

const initialGameTime: GameTime = {
  day: 1,
  hour: 8,
  minute: 0,
  totalTicks: 0,
  ticksPerSecond: 10,
  isPaused: true,
  speed: 1
};

const initialTutorialProgress: TutorialProgress = {
  currentStep: 0,
  completedSteps: [],
  isActive: true
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      gameTime: initialGameTime,
      config: defaultConfig,
      tutorialProgress: initialTutorialProgress,
      notifications: [],
      isGameStarted: false,

      setGameSpeed: (speed) => set((state) => ({
        gameTime: { ...state.gameTime, speed, isPaused: false }
      })),

      togglePause: () => set((state) => ({
        gameTime: { ...state.gameTime, isPaused: !state.gameTime.isPaused }
      })),

      advanceTick: () => set((state) => {
        const { gameTime, config } = state;
        if (gameTime.isPaused) return state;

        let newMinute = gameTime.minute + (6 * gameTime.speed); // 6 minutes per tick
        let newHour = gameTime.hour;
        let newDay = gameTime.day;

        while (newMinute >= 60) {
          newMinute -= 60;
          newHour += 1;
        }

        while (newHour >= 24) {
          newHour -= 24;
          newDay += 1;
        }

        return {
          gameTime: {
            ...gameTime,
            day: newDay,
            hour: newHour,
            minute: Math.floor(newMinute),
            totalTicks: gameTime.totalTicks + 1
          }
        };
      }),

      advanceTutorial: () => set((state) => ({
        tutorialProgress: {
          ...state.tutorialProgress,
          currentStep: state.tutorialProgress.currentStep + 1,
          completedSteps: [
            ...state.tutorialProgress.completedSteps,
            `step-${state.tutorialProgress.currentStep}`
          ]
        }
      })),

      skipTutorial: () => set({
        tutorialProgress: {
          currentStep: 999,
          completedSteps: [],
          isActive: false
        }
      }),

      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: uuidv4(),
            timestamp: Date.now(),
            read: false
          },
          ...state.notifications.slice(0, 49) // Keep max 50 notifications
        ]
      })),

      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        )
      })),

      clearNotifications: () => set({ notifications: [] }),

      startNewGame: () => set({
        isGameStarted: true,
        gameTime: { ...initialGameTime, isPaused: false },
        tutorialProgress: initialTutorialProgress
      }),

      resetGame: () => set({
        isGameStarted: false,
        gameTime: initialGameTime,
        tutorialProgress: initialTutorialProgress,
        notifications: []
      })
    }),
    {
      name: 'farmiq-game-store',
      partialize: (state) => ({
        gameTime: state.gameTime,
        tutorialProgress: state.tutorialProgress,
        isGameStarted: state.isGameStarted
      })
    }
  )
);

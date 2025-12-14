import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useCropStore } from '../store/cropStore';
import { useEquipmentStore } from '../store/equipmentStore';
import { useEnvironmentStore } from '../store/environmentStore';

export interface SaveGameData {
  version: string;
  timestamp: number;
  game: ReturnType<typeof useGameStore.getState>;
  player: ReturnType<typeof usePlayerStore.getState>;
  crops: ReturnType<typeof useCropStore.getState>;
  equipment: ReturnType<typeof useEquipmentStore.getState>;
  environment: ReturnType<typeof useEnvironmentStore.getState>;
}

const SAVE_VERSION = '1.0.0';

/**
 * Export all game data to a JSON object
 */
export function exportGameData(): SaveGameData {
  return {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    game: useGameStore.getState(),
    player: usePlayerStore.getState(),
    crops: useCropStore.getState(),
    equipment: useEquipmentStore.getState(),
    environment: useEnvironmentStore.getState()
  };
}

/**
 * Import game data from a JSON object
 */
export function importGameData(data: SaveGameData): boolean {
  try {
    // Validate version
    if (!data.version || !data.timestamp) {
      throw new Error('Invalid save file format');
    }

    // Import each store's data
    if (data.game) {
      const { gameTime, tutorialProgress, isGameStarted, notifications } = data.game;
      useGameStore.setState({ gameTime, tutorialProgress, isGameStarted, notifications });
    }

    if (data.player) {
      const { money, experience, level, unlockedCrops, unlockedEquipment, techTree, achievements, statistics, settings } = data.player;
      usePlayerStore.setState({ money, experience, level, unlockedCrops, unlockedEquipment, techTree, achievements, statistics, settings });
    }

    if (data.crops) {
      const { crops } = data.crops;
      useCropStore.setState({ crops });
    }

    if (data.equipment) {
      const { equipment, automationRules, totalEnergyUsed } = data.equipment;
      useEquipmentStore.setState({ equipment, automationRules, totalEnergyUsed });
    }

    if (data.environment) {
      const { environment, history } = data.environment;
      useEnvironmentStore.setState({ environment, history });
    }

    return true;
  } catch (error) {
    console.error('Failed to import game data:', error);
    return false;
  }
}

/**
 * Download game save as a JSON file
 */
export function downloadSaveFile(): void {
  const data = exportGameData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `farmiq-save-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Load game save from a file input
 */
export function loadSaveFile(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as SaveGameData;
        const success = importGameData(data);
        resolve(success);
      } catch (error) {
        console.error('Failed to parse save file:', error);
        resolve(false);
      }
    };

    reader.onerror = () => {
      console.error('Failed to read save file');
      resolve(false);
    };

    reader.readAsText(file);
  });
}

/**
 * Reset all game data to initial state
 */
export function resetAllGameData(): void {
  useGameStore.getState().resetGame();
  usePlayerStore.getState().resetPlayer();
  useCropStore.getState().resetCrops();
  useEquipmentStore.getState().resetEquipment();
  useEnvironmentStore.getState().resetEnvironment();

  // Clear localStorage
  localStorage.removeItem('farmiq-game-store');
  localStorage.removeItem('farmiq-player-store');
  localStorage.removeItem('farmiq-crop-store');
  localStorage.removeItem('farmiq-equipment-store');
  localStorage.removeItem('farmiq-environment-store');
}

/**
 * Get save file info without importing
 */
export function getSaveFileInfo(data: SaveGameData): {
  version: string;
  date: string;
  playTime: string;
  level: number;
  money: number;
  day: number;
} | null {
  try {
    const playTimeSeconds = data.player?.statistics?.playTime || 0;
    const hours = Math.floor(playTimeSeconds / 3600);
    const minutes = Math.floor((playTimeSeconds % 3600) / 60);

    return {
      version: data.version,
      date: new Date(data.timestamp).toLocaleString('ko-KR'),
      playTime: hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`,
      level: data.player?.level || 1,
      money: data.player?.money || 0,
      day: data.game?.gameTime?.day || 1
    };
  } catch {
    return null;
  }
}

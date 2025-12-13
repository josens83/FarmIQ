import React from 'react';
import { cropDefinitions } from '../../data/crops';
import { ProgressBar } from '../common';
import type { CropInstance } from '../../types';

interface CropTileProps {
  crop: CropInstance;
  onSelect: (crop: CropInstance) => void;
  isSelected: boolean;
}

export const CropTile: React.FC<CropTileProps> = ({
  crop,
  onSelect,
  isSelected
}) => {
  const definition = cropDefinitions[crop.cropId];
  if (!definition) return null;

  const currentStage = definition.stages[crop.currentStage];
  const stageSprite = definition.sprites[currentStage?.id || 'seed'];

  // Determine health color
  const healthColor = crop.health > 70 ? 'green' : crop.health > 40 ? 'yellow' : 'red';

  // Determine if stressed
  const totalStress = Object.values(crop.stressFactors).reduce((a, b) => a + b, 0) / 4;
  const isStressed = totalStress > 30;

  return (
    <div
      onClick={() => onSelect(crop)}
      className={`
        relative w-full h-full flex flex-col items-center justify-center
        cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-slate-900' : ''}
        ${isStressed ? 'animate-pulse' : ''}
        ${crop.harvestable ? 'bg-green-500/20' : ''}
        hover:bg-white/5 rounded-lg p-1
      `}
    >
      {/* Crop sprite */}
      <div className={`text-3xl sm:text-4xl crop-growing ${isStressed ? 'opacity-75' : ''}`}>
        {stageSprite}
      </div>

      {/* Stage indicator */}
      <div className="absolute top-0.5 right-0.5 text-xs px-1 py-0.5 bg-slate-800/80 rounded text-slate-300">
        {currentStage?.nameKo || '?'}
      </div>

      {/* Health bar */}
      <div className="absolute bottom-1 left-1 right-1">
        <ProgressBar
          value={crop.growthProgress}
          color={crop.harvestable ? 'green' : 'blue'}
          size="sm"
        />
      </div>

      {/* Health indicator (small dot) */}
      <div
        className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full ${
          healthColor === 'green' ? 'bg-green-500' :
          healthColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
        }`}
      />

      {/* Harvestable indicator */}
      {crop.harvestable && (
        <div className="absolute -top-1 -right-1 text-lg animate-bounce">
          ✨
        </div>
      )}
    </div>
  );
};

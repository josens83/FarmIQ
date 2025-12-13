import React, { useState } from 'react';
import { Plus, Shovel, Droplet, Scissors } from 'lucide-react';
import { useCropStore } from '../../store/cropStore';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';
import { CropTile } from './CropTile';
import { CropSelector } from './CropSelector';
import { CropDetail } from './CropDetail';
import { Button, Modal } from '../common';
import { GameEngine } from '../../game/engine/GameEngine';
import type { CropInstance } from '../../types';

interface FarmGridProps {
  gridWidth?: number;
  gridHeight?: number;
}

export const FarmGrid: React.FC<FarmGridProps> = ({
  gridWidth = 8,
  gridHeight = 6
}) => {
  const { crops } = useCropStore();
  const { unlockedCrops } = usePlayerStore();
  const { addNotification } = useGameStore();

  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<CropInstance | null>(null);
  const [showCropSelector, setShowCropSelector] = useState(false);

  // Get crop at position
  const getCropAt = (x: number, y: number) => {
    return crops.find((c) => c.position.x === x && c.position.y === y);
  };

  // Handle cell click
  const handleCellClick = (x: number, y: number) => {
    const crop = getCropAt(x, y);
    if (crop) {
      setSelectedCrop(crop);
      setSelectedCell(null);
    } else {
      setSelectedCell({ x, y });
      setSelectedCrop(null);
      setShowCropSelector(true);
    }
  };

  // Handle plant crop
  const handlePlantCrop = (cropId: string) => {
    if (!selectedCell) return;

    const success = GameEngine.plantCrop(cropId, selectedCell);
    if (success) {
      addNotification({
        type: 'success',
        title: '작물 심기 완료',
        message: `새로운 작물을 심었습니다!`
      });
    }
    setShowCropSelector(false);
    setSelectedCell(null);
  };

  // Handle harvest
  const handleHarvest = () => {
    if (!selectedCrop) return;

    const success = GameEngine.harvestCrop(selectedCrop.instanceId);
    if (success) {
      setSelectedCrop(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Farm Grid */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="grid gap-1 sm:gap-2 p-4 bg-gradient-to-br from-amber-900/30 to-green-900/30 rounded-2xl border border-amber-800/30"
          style={{
            gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
            maxWidth: '100%',
            aspectRatio: `${gridWidth} / ${gridHeight}`
          }}
        >
          {Array.from({ length: gridHeight }, (_, y) =>
            Array.from({ length: gridWidth }, (_, x) => {
              const crop = getCropAt(x, y);
              const isSelectedCell = selectedCell?.x === x && selectedCell?.y === y;

              return (
                <div
                  key={`${x}-${y}`}
                  onClick={() => handleCellClick(x, y)}
                  className={`
                    aspect-square min-w-[40px] min-h-[40px]
                    bg-gradient-to-br from-amber-800/40 to-amber-900/40
                    border border-amber-700/30 rounded-lg
                    cursor-pointer transition-all duration-200
                    hover:from-amber-700/50 hover:to-amber-800/50
                    hover:border-amber-600/50
                    flex items-center justify-center
                    ${isSelectedCell ? 'ring-2 ring-green-400' : ''}
                  `}
                >
                  {crop ? (
                    <CropTile
                      crop={crop}
                      onSelect={setSelectedCrop}
                      isSelected={selectedCrop?.instanceId === crop.instanceId}
                    />
                  ) : (
                    <Plus className="w-4 h-4 text-amber-600/50" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Crop Selector Modal */}
      <Modal
        isOpen={showCropSelector}
        onClose={() => {
          setShowCropSelector(false);
          setSelectedCell(null);
        }}
        title="작물 선택"
        size="lg"
      >
        <CropSelector
          unlockedCrops={unlockedCrops}
          onSelect={handlePlantCrop}
          onCancel={() => setShowCropSelector(false)}
        />
      </Modal>

      {/* Crop Detail Modal */}
      <Modal
        isOpen={!!selectedCrop}
        onClose={() => setSelectedCrop(null)}
        title="작물 상세"
        size="md"
      >
        {selectedCrop && (
          <CropDetail
            crop={selectedCrop}
            onHarvest={handleHarvest}
            onClose={() => setSelectedCrop(null)}
          />
        )}
      </Modal>
    </div>
  );
};

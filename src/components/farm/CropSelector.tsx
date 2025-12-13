import React from 'react';
import { Star, Clock, Coins } from 'lucide-react';
import { cropDefinitions } from '../../data/crops';
import { Button, Card } from '../common';

interface CropSelectorProps {
  unlockedCrops: string[];
  onSelect: (cropId: string) => void;
  onCancel: () => void;
}

export const CropSelector: React.FC<CropSelectorProps> = ({
  unlockedCrops,
  onSelect,
  onCancel
}) => {
  const availableCrops = Object.values(cropDefinitions).filter(
    (crop) => unlockedCrops.includes(crop.id)
  );

  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">
        재배할 작물을 선택하세요. 각 작물은 서로 다른 환경 조건이 필요합니다.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {availableCrops.map((crop) => (
          <Card
            key={crop.id}
            hover
            padding="sm"
            className="group"
          >
            <div
              onClick={() => onSelect(crop.id)}
              className="flex items-start gap-3"
            >
              {/* Crop Icon */}
              <div className="text-4xl p-2 bg-slate-700/50 rounded-lg">
                {crop.sprites.harvest}
              </div>

              {/* Crop Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white truncate">
                    {crop.nameKo}
                  </h3>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < crop.difficulty ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {crop.descriptionKo}
                </p>

                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{crop.growthDays}일</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="w-3 h-3 text-yellow-400" />
                    <span>${crop.basePrice}/kg</span>
                  </div>
                </div>

                {/* Optimal conditions preview */}
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                    {crop.optimalConditions.temperature.min}-{crop.optimalConditions.temperature.max}°C
                  </span>
                  <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                    {crop.optimalConditions.humidity.min}-{crop.optimalConditions.humidity.max}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={onCancel}>
          취소
        </Button>
      </div>
    </div>
  );
};

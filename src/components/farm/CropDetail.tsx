import React from 'react';
import { Scissors, Heart, Sparkles, AlertTriangle, Thermometer, Droplets, Leaf, FlaskConical } from 'lucide-react';
import { cropDefinitions } from '../../data/crops';
import { EconomySystem } from '../../game/systems/EconomySystem';
import { Button, ProgressBar, Card } from '../common';
import type { CropInstance } from '../../types';

interface CropDetailProps {
  crop: CropInstance;
  onHarvest: () => void;
  onClose: () => void;
}

export const CropDetail: React.FC<CropDetailProps> = ({
  crop,
  onHarvest,
  onClose
}) => {
  const definition = cropDefinitions[crop.cropId];
  if (!definition) return null;

  const currentStage = definition.stages[crop.currentStage];
  const { revenue, yield: yieldAmount } = EconomySystem.estimateHarvestRevenue(
    crop.cropId,
    crop.quality,
    crop.health
  );

  // Calculate quality grade
  const qualityGrade = crop.quality >= 90 ? '최상' :
                       crop.quality >= 70 ? '우수' :
                       crop.quality >= 40 ? '보통' : '저급';

  const qualityColor = crop.quality >= 90 ? 'text-purple-400' :
                       crop.quality >= 70 ? 'text-green-400' :
                       crop.quality >= 40 ? 'text-yellow-400' : 'text-red-400';

  // Check stress levels
  const hasStress = Object.values(crop.stressFactors).some(v => v > 30);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="text-5xl p-3 bg-slate-700/50 rounded-xl">
          {definition.sprites[currentStage?.id || 'seed']}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{definition.nameKo}</h3>
          <p className="text-slate-400">{currentStage?.nameKo || '알 수 없음'} 단계</p>
        </div>
      </div>

      {/* Growth Progress */}
      <Card padding="sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">성장 진행률</span>
          <span className="text-sm font-medium text-white">{crop.growthProgress.toFixed(1)}%</span>
        </div>
        <ProgressBar
          value={crop.growthProgress}
          color={crop.harvestable ? 'green' : 'blue'}
          size="md"
        />
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Health */}
        <Card padding="sm">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-sm text-slate-400">건강도</span>
          </div>
          <ProgressBar value={crop.health} color={crop.health > 70 ? 'green' : crop.health > 40 ? 'yellow' : 'red'} size="sm" showLabel />
        </Card>

        {/* Quality */}
        <Card padding="sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-slate-400">품질</span>
          </div>
          <div className="flex items-center justify-between">
            <ProgressBar value={crop.quality} color="purple" size="sm" className="flex-1 mr-2" />
            <span className={`text-sm font-medium ${qualityColor}`}>{qualityGrade}</span>
          </div>
        </Card>
      </div>

      {/* Stress Indicators */}
      {hasStress && (
        <Card padding="sm" className="border-yellow-500/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">스트레스 요인</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {crop.stressFactors.temperature > 20 && (
              <div className="flex items-center gap-2 text-xs text-red-400">
                <Thermometer className="w-3 h-3" />
                <span>온도 스트레스: {crop.stressFactors.temperature.toFixed(0)}%</span>
              </div>
            )}
            {crop.stressFactors.water > 20 && (
              <div className="flex items-center gap-2 text-xs text-blue-400">
                <Droplets className="w-3 h-3" />
                <span>수분 스트레스: {crop.stressFactors.water.toFixed(0)}%</span>
              </div>
            )}
            {crop.stressFactors.nutrient > 20 && (
              <div className="flex items-center gap-2 text-xs text-orange-400">
                <FlaskConical className="w-3 h-3" />
                <span>영양 스트레스: {crop.stressFactors.nutrient.toFixed(0)}%</span>
              </div>
            )}
            {crop.stressFactors.disease > 20 && (
              <div className="flex items-center gap-2 text-xs text-purple-400">
                <Leaf className="w-3 h-3" />
                <span>질병 스트레스: {crop.stressFactors.disease.toFixed(0)}%</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Harvest Preview */}
      {crop.harvestable && (
        <Card padding="sm" className="border-green-500/30 bg-green-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-400 font-medium">수확 가능!</p>
              <p className="text-xs text-slate-400">
                예상 수확량: {yieldAmount.toFixed(2)}kg • 예상 수익: ${revenue.toFixed(2)}
              </p>
            </div>
            <Button onClick={onHarvest} variant="success" icon={<Scissors className="w-4 h-4" />}>
              수확
            </Button>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
};

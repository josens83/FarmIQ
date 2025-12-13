import React, { useState } from 'react';
import { Power, Settings, Zap, ChevronUp, ChevronDown, Target, Gauge } from 'lucide-react';
import { useEquipmentStore } from '../../store/equipmentStore';
import { usePlayerStore } from '../../store/playerStore';
import { equipmentDefinitions, getUpgradeCost } from '../../data/equipment';
import { Button, Card, ProgressBar, Modal } from '../common';
import { GameEngine } from '../../game/engine/GameEngine';
import type { EquipmentInstance } from '../../types';

export const EquipmentPanel: React.FC = () => {
  const { equipment, toggleEquipment, toggleAutoMode, setTargetValue } = useEquipmentStore();
  const { money } = usePlayerStore();
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentInstance | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Group equipment by type
  const groupedEquipment = equipment.reduce((acc, eq) => {
    const def = equipmentDefinitions[eq.definitionId];
    if (!def) return acc;

    const category = def.type.includes('heater') || def.type.includes('cooler')
      ? '온도 제어'
      : def.type.includes('humid') || def.type === 'fan'
      ? '습도 제어'
      : def.type === 'led_panel'
      ? '조명'
      : def.type.includes('irrigation') || def.type === 'nutrient_pump'
      ? '관개/양액'
      : '기타';

    if (!acc[category]) acc[category] = [];
    acc[category].push(eq);
    return acc;
  }, {} as Record<string, EquipmentInstance[]>);

  const handleUpgrade = () => {
    if (!selectedEquipment) return;
    const success = GameEngine.upgradeEquipment(selectedEquipment.id);
    if (success) {
      // Refresh selected equipment
      const updated = useEquipmentStore.getState().equipment.find(
        e => e.id === selectedEquipment.id
      );
      setSelectedEquipment(updated || null);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Settings className="w-5 h-5 text-slate-400" />
        장비 제어
      </h3>

      {Object.entries(groupedEquipment).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <h4 className="text-sm font-medium text-slate-400">{category}</h4>
          {items.map((eq) => {
            const def = equipmentDefinitions[eq.definitionId];
            if (!def) return null;

            return (
              <Card key={eq.id} padding="sm" className="group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl p-2 rounded-lg ${
                      eq.isActive ? 'bg-green-500/20' : 'bg-slate-700/50'
                    }`}>
                      {def.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{def.nameKo}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">
                          Lv.{eq.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {eq.powerConsumption.toFixed(1)} kWh
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3 h-3" />
                          {eq.efficiency}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {eq.autoMode && (
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                        자동
                      </span>
                    )}
                    <button
                      onClick={() => toggleEquipment(eq.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        eq.isActive
                          ? 'bg-green-600 hover:bg-green-500 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-400'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEquipment(eq);
                        setShowSettings(true);
                      }}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ))}

      {equipment.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p>장비가 없습니다.</p>
          <p className="text-sm mt-1">상점에서 장비를 구매하세요.</p>
        </div>
      )}

      {/* Equipment Settings Modal */}
      <Modal
        isOpen={showSettings && !!selectedEquipment}
        onClose={() => {
          setShowSettings(false);
          setSelectedEquipment(null);
        }}
        title="장비 설정"
        size="md"
      >
        {selectedEquipment && (
          <EquipmentSettings
            equipment={selectedEquipment}
            onToggleAuto={() => toggleAutoMode(selectedEquipment.id)}
            onSetTarget={(value) => setTargetValue(selectedEquipment.id, value)}
            onUpgrade={handleUpgrade}
            canUpgrade={money >= getUpgradeCost(selectedEquipment.definitionId, selectedEquipment.level)}
            upgradeCost={getUpgradeCost(selectedEquipment.definitionId, selectedEquipment.level)}
          />
        )}
      </Modal>
    </div>
  );
};

interface EquipmentSettingsProps {
  equipment: EquipmentInstance;
  onToggleAuto: () => void;
  onSetTarget: (value: number) => void;
  onUpgrade: () => void;
  canUpgrade: boolean;
  upgradeCost: number;
}

const EquipmentSettings: React.FC<EquipmentSettingsProps> = ({
  equipment,
  onToggleAuto,
  onSetTarget,
  onUpgrade,
  canUpgrade,
  upgradeCost
}) => {
  const def = equipmentDefinitions[equipment.definitionId];
  if (!def) return null;

  const [targetValue, setTargetValue] = useState(equipment.targetValue || 0);

  const targetRanges: Record<string, { min: number; max: number; step: number }> = {
    heater: { min: 10, max: 35, step: 1 },
    cooler: { min: 10, max: 35, step: 1 },
    humidifier: { min: 30, max: 90, step: 5 },
    dehumidifier: { min: 30, max: 90, step: 5 },
    irrigation: { min: 30, max: 80, step: 5 },
    nutrient_pump: { min: 0.5, max: 3.5, step: 0.1 },
    co2_generator: { min: 400, max: 1500, step: 50 }
  };

  const range = targetRanges[def.type] || { min: 0, max: 100, step: 1 };

  return (
    <div className="space-y-4">
      {/* Equipment Info */}
      <div className="flex items-center gap-4">
        <div className="text-4xl p-3 bg-slate-700/50 rounded-xl">
          {def.icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{def.nameKo}</h3>
          <p className="text-slate-400">레벨 {equipment.level} / {def.maxLevel}</p>
        </div>
      </div>

      {/* Stats */}
      <Card padding="sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400">효과</p>
            <p className="text-white font-medium">
              {(def.baseEffect * (1 + (equipment.level - 1) * 0.15)).toFixed(1)} {def.effectUnit}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">효율</p>
            <p className="text-white font-medium">{equipment.efficiency}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">전력 소비</p>
            <p className="text-white font-medium">{equipment.powerConsumption.toFixed(2)} kWh</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">상태</p>
            <p className={equipment.isActive ? 'text-green-400' : 'text-slate-400'}>
              {equipment.isActive ? '작동 중' : '정지'}
            </p>
          </div>
        </div>
      </Card>

      {/* Auto Mode */}
      <Card padding="sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-white">자동 모드</span>
          </div>
          <button
            onClick={onToggleAuto}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              equipment.autoMode ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              equipment.autoMode ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>

        {equipment.autoMode && (
          <div>
            <label className="text-sm text-slate-400">목표값</label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="range"
                min={range.min}
                max={range.max}
                step={range.step}
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className="text-white font-mono w-16 text-right">
                {targetValue.toFixed(range.step < 1 ? 1 : 0)}
              </span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onSetTarget(targetValue)}
              className="mt-2 w-full"
            >
              적용
            </Button>
          </div>
        )}
      </Card>

      {/* Upgrade */}
      {equipment.level < def.maxLevel && (
        <Card padding="sm" className="border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-400">
                레벨 {equipment.level + 1}로 업그레이드
              </p>
              <p className="text-xs text-slate-400">
                효율 +5%, 전력 -10%
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={onUpgrade}
              disabled={!canUpgrade}
              icon={<ChevronUp className="w-4 h-4" />}
            >
              ${upgradeCost}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

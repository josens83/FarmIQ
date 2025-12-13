import React, { useState } from 'react';
import { ShoppingCart, Lock, Coins, Zap, Star } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { equipmentDefinitions, getUnlockedEquipment } from '../../data/equipment';
import { cropDefinitions, getUnlockedCrops } from '../../data/crops';
import { Button, Card, Modal } from '../common';
import { GameEngine } from '../../game/engine/GameEngine';

type ShopTab = 'equipment' | 'crops';

export const ShopPanel: React.FC = () => {
  const { money, level } = usePlayerStore();
  const { equipment } = useEquipmentStore();
  const [activeTab, setActiveTab] = useState<ShopTab>('equipment');
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  const unlockedEquipment = getUnlockedEquipment(level);
  const unlockedCrops = getUnlockedCrops(level);

  // Check if equipment already owned
  const isOwned = (definitionId: string) => {
    return equipment.some(eq => eq.definitionId === definitionId);
  };

  const handlePurchaseEquipment = (definitionId: string) => {
    const success = GameEngine.buyEquipment(definitionId);
    if (success) {
      const def = equipmentDefinitions[definitionId];
      setPurchaseSuccess(def?.nameKo || '장비');
      setTimeout(() => setPurchaseSuccess(null), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 p-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-slate-400" />
          상점
        </h3>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-lg">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="font-medium text-white">${money.toFixed(0)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['equipment', 'crops'] as ShopTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {tab === 'equipment' ? '장비' : '작물 정보'}
          </button>
        ))}
      </div>

      {/* Purchase Success Message */}
      {purchaseSuccess && (
        <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-center animate-in fade-in">
          {purchaseSuccess} 구매 완료!
        </div>
      )}

      {/* Equipment List */}
      {activeTab === 'equipment' && (
        <div className="space-y-3">
          {Object.values(equipmentDefinitions).map((def) => {
            const isUnlocked = def.unlockLevel <= level;
            const owned = isOwned(def.id);
            const canAfford = money >= def.baseCost;

            return (
              <Card key={def.id} padding="sm" className={!isUnlocked ? 'opacity-50' : ''}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl p-2 rounded-lg ${
                      isUnlocked ? 'bg-slate-700/50' : 'bg-slate-800/50'
                    }`}>
                      {isUnlocked ? def.icon : <Lock className="w-6 h-6 text-slate-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                          {def.nameKo}
                        </span>
                        {!isUnlocked && (
                          <span className="text-xs px-1.5 py-0.5 bg-slate-700 rounded text-slate-500">
                            Lv.{def.unlockLevel}
                          </span>
                        )}
                        {owned && (
                          <span className="text-xs px-1.5 py-0.5 bg-green-500/20 rounded text-green-400">
                            보유
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {def.descriptionKo}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {def.basePowerConsumption} kWh
                        </span>
                        <span>
                          {def.baseEffect} {def.effectUnit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isUnlocked && !owned && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePurchaseEquipment(def.id)}
                      disabled={!canAfford}
                      icon={<Coins className="w-4 h-4" />}
                    >
                      ${def.baseCost}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Crops Info */}
      {activeTab === 'crops' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            작물은 농장 그리드에서 직접 심을 수 있습니다. 아래는 사용 가능한 작물 정보입니다.
          </p>
          {Object.values(cropDefinitions).map((crop) => {
            const isUnlocked = crop.unlockLevel <= level;

            return (
              <Card key={crop.id} padding="sm" className={!isUnlocked ? 'opacity-50' : ''}>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {isUnlocked ? crop.sprites.harvest : '🔒'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                        {crop.nameKo}
                      </span>
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
                      {!isUnlocked && (
                        <span className="text-xs px-1.5 py-0.5 bg-slate-700 rounded text-slate-500">
                          Lv.{crop.unlockLevel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                      <span>성장: {crop.growthDays}일</span>
                      <span className="text-yellow-400">${crop.basePrice}/kg</span>
                      <span className="text-red-400">
                        {crop.optimalConditions.temperature.min}-{crop.optimalConditions.temperature.max}°C
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

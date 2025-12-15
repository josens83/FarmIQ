import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useWorldStore, usePlayerStore } from '../../store';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';

export const ResourcePanel = memo(function ResourcePanel() {
  const { i18n } = useTranslation();
  const { resources, purchaseResources } = useWorldStore();
  const { money, spendMoney } = usePlayerStore();
  const isKorean = i18n.language === 'ko';

  const handlePurchaseWater = () => {
    const amount = 500; // liters
    const cost = purchaseResources('water', amount);
    spendMoney(cost);
  };

  const handlePurchaseNutrients = () => {
    const amount = 30; // kg total (10 each N/P/K)
    const cost = purchaseResources('nutrients', amount);
    spendMoney(cost);
  };

  const waterPercentage = (resources.water.available / resources.water.capacity) * 100;
  const nitrogenPercentage = (resources.nutrients.nitrogen / resources.nutrients.capacity) * 100;
  const phosphorusPercentage = (resources.nutrients.phosphorus / resources.nutrients.capacity) * 100;
  const potassiumPercentage = (resources.nutrients.potassium / resources.nutrients.capacity) * 100;

  const getStatusColor = (percentage: number): 'green' | 'yellow' | 'red' => {
    if (percentage > 60) return 'green';
    if (percentage > 30) return 'yellow';
    return 'red';
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">
        {isKorean ? '자원 관리' : 'Resources'}
      </h3>

      {/* Water */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">💧</span>
            <span className="font-medium">{isKorean ? '물' : 'Water'}</span>
          </div>
          <span className="text-sm text-gray-600">
            {Math.round(resources.water.available)}L / {resources.water.capacity}L
          </span>
        </div>
        <ProgressBar
          value={waterPercentage}
          max={100}
          className="h-3"
          color={getStatusColor(waterPercentage)}
        />
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>
            {isKorean ? '일일 사용량' : 'Daily usage'}: {resources.water.dailyUsage.toFixed(1)}L
          </span>
          <span>
            {isKorean ? '재활용 효율' : 'Recycling'}: {(resources.water.efficiency * 100).toFixed(0)}%
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="mt-2 w-full"
          onClick={handlePurchaseWater}
          disabled={money < 1}
        >
          {isKorean ? '물 500L 구매 ($1.00)' : 'Buy 500L Water ($1.00)'}
        </Button>
      </div>

      {/* Nutrients */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🧪</span>
          <span className="font-medium">{isKorean ? '영양소' : 'Nutrients'}</span>
        </div>

        {/* Nitrogen */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-blue-600">N ({isKorean ? '질소' : 'Nitrogen'})</span>
            <span>{Math.round(resources.nutrients.nitrogen)}kg</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${nitrogenPercentage}%` }}
            />
          </div>
        </div>

        {/* Phosphorus */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-orange-600">P ({isKorean ? '인' : 'Phosphorus'})</span>
            <span>{Math.round(resources.nutrients.phosphorus)}kg</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${phosphorusPercentage}%` }}
            />
          </div>
        </div>

        {/* Potassium */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-purple-600">K ({isKorean ? '칼륨' : 'Potassium'})</span>
            <span>{Math.round(resources.nutrients.potassium)}kg</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${potassiumPercentage}%` }}
            />
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="mt-2 w-full"
          onClick={handlePurchaseNutrients}
          disabled={money < 50}
        >
          {isKorean ? 'NPK 각 10kg 구매 ($50)' : 'Buy 10kg each NPK ($50)'}
        </Button>
      </div>

      {/* Energy */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="font-medium">{isKorean ? '에너지' : 'Energy'}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-gray-500">{isKorean ? '일일 사용량' : 'Daily Usage'}</p>
            <p className="font-bold">{resources.energy.dailyUsage.toFixed(1)} kWh</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-gray-500">{isKorean ? '비용' : 'Cost'}</p>
            <p className="font-bold">
              ${(resources.energy.dailyUsage * resources.energy.costPerKwh).toFixed(2)}/day
            </p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-gray-500">{isKorean ? '최대 부하' : 'Peak Usage'}</p>
            <p className="font-bold">{resources.energy.peakUsage.toFixed(1)} kWh</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-gray-500">{isKorean ? '효율' : 'Efficiency'}</p>
            <p className="font-bold">{(resources.energy.efficiency * 100).toFixed(0)}%</p>
          </div>
        </div>

        {resources.energy.solarGeneration > 0 && (
          <div className="mt-2 p-2 bg-yellow-50 rounded flex items-center gap-2">
            <span>☀️</span>
            <span className="text-sm">
              {isKorean ? '태양광 발전' : 'Solar'}: {resources.energy.solarGeneration.toFixed(1)} kWh
            </span>
          </div>
        )}
      </div>

      {/* Resource Warnings */}
      {(waterPercentage < 20 || nitrogenPercentage < 20 || phosphorusPercentage < 20 || potassiumPercentage < 20) && (
        <motion.div
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-red-600 font-medium">
            ⚠️ {isKorean ? '자원 부족 경고!' : 'Low Resource Warning!'}
          </p>
          <p className="text-xs text-red-500 mt-1">
            {waterPercentage < 20 && (isKorean ? '물이 부족합니다. ' : 'Water is low. ')}
            {nitrogenPercentage < 20 && (isKorean ? '질소가 부족합니다. ' : 'Nitrogen is low. ')}
            {phosphorusPercentage < 20 && (isKorean ? '인이 부족합니다. ' : 'Phosphorus is low. ')}
            {potassiumPercentage < 20 && (isKorean ? '칼륨이 부족합니다.' : 'Potassium is low.')}
          </p>
        </motion.div>
      )}
    </Card>
  );
});

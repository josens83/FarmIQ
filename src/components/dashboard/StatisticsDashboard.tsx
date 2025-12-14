import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Leaf,
  Zap,
  Clock,
  Award,
  BarChart3
} from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';
import { useCropStore } from '../../store/cropStore';
import { FadeIn, StaggerContainer, StaggerItem, CountUp } from '../common/AnimatedCard';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color: 'green' | 'blue' | 'yellow' | 'purple' | 'red';
}

const StatCard = memo<StatCardProps>(function StatCard({
  icon,
  label,
  value,
  subValue,
  trend,
  color
}) {
  const colorClasses = {
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400'
  };

  const iconBgClasses = {
    green: 'bg-green-500/20',
    blue: 'bg-blue-500/20',
    yellow: 'bg-yellow-500/20',
    purple: 'bg-purple-500/20',
    red: 'bg-red-500/20'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${iconBgClasses[color]}`}>
          {icon}
        </div>
        {trend && trend !== 'neutral' && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
        )}
      </div>
      <div className="mb-1">
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <div className="text-sm text-slate-400">{label}</div>
      {subValue && (
        <div className="text-xs text-slate-500 mt-1">{subValue}</div>
      )}
    </motion.div>
  );
});

interface CropStatProps {
  cropId: string;
  count: number;
  total: number;
}

const CropStat = memo<CropStatProps>(function CropStat({ cropId, count, total }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  const cropEmojis: Record<string, string> = {
    lettuce: '🥬',
    spinach: '🥗',
    tomato: '🍅',
    strawberry: '🍓',
    pepper: '🌶️',
    cucumber: '🥒',
    basil: '🌿',
    default: '🌱'
  };

  const cropNames: Record<string, string> = {
    lettuce: '상추',
    spinach: '시금치',
    tomato: '토마토',
    strawberry: '딸기',
    pepper: '고추',
    cucumber: '오이',
    basil: '바질'
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
      <span className="text-2xl">{cropEmojis[cropId] || cropEmojis.default}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-white">{cropNames[cropId] || cropId}</span>
          <span className="text-sm text-slate-400">{count}회</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
          />
        </div>
      </div>
    </div>
  );
});

export const StatisticsDashboard = memo(function StatisticsDashboard() {
  const playerState = usePlayerStore();
  const { gameTime } = useGameStore();
  const { crops } = useCropStore();

  const stats = useMemo(() => {
    const { statistics, money, level, experience } = playerState;

    // Calculate profit
    const profit = statistics.totalRevenue - statistics.totalExpenses;
    const profitTrend = profit >= 0 ? 'up' : 'down';

    // Format play time
    const hours = Math.floor(statistics.playTime / 3600);
    const minutes = Math.floor((statistics.playTime % 3600) / 60);
    const playTimeFormatted = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;

    // Get crop statistics sorted by count
    const cropStats = Object.entries(statistics.cropsGrown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const totalCropsGrown = Object.values(statistics.cropsGrown).reduce((a, b) => a + b, 0);

    return {
      money: money.toLocaleString(),
      profit: profit >= 0 ? `+$${profit.toLocaleString()}` : `-$${Math.abs(profit).toLocaleString()}`,
      profitTrend,
      revenue: `$${statistics.totalRevenue.toLocaleString()}`,
      expenses: `$${statistics.totalExpenses.toLocaleString()}`,
      harvests: statistics.totalHarvests,
      energy: `${statistics.totalEnergyUsed.toFixed(1)} kWh`,
      playTime: playTimeFormatted,
      days: statistics.daysPlayed,
      level,
      experience,
      currentCrops: crops.length,
      harvestablecrops: crops.filter(c => c.harvestable).length,
      cropStats,
      totalCropsGrown
    };
  }, [playerState, crops]);

  return (
    <div className="p-4 space-y-6">
      <FadeIn>
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
          <BarChart3 className="w-6 h-6 text-green-400" />
          농장 통계
        </h2>
      </FadeIn>

      {/* Main Stats Grid */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.05}>
        <StaggerItem>
          <StatCard
            icon={<DollarSign className="w-5 h-5 text-green-400" />}
            label="현재 자금"
            value={`$${stats.money}`}
            color="green"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
            label="총 수익"
            value={stats.profit}
            subValue={`수입: ${stats.revenue} / 지출: ${stats.expenses}`}
            trend={stats.profitTrend as 'up' | 'down'}
            color="blue"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<Leaf className="w-5 h-5 text-yellow-400" />}
            label="총 수확"
            value={stats.harvests}
            subValue={`현재 재배 중: ${stats.currentCrops}개`}
            color="yellow"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<Zap className="w-5 h-5 text-purple-400" />}
            label="에너지 사용량"
            value={stats.energy}
            color="purple"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Secondary Stats */}
      <StaggerContainer className="grid grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.05}>
        <StaggerItem>
          <StatCard
            icon={<Clock className="w-5 h-5 text-blue-400" />}
            label="플레이 시간"
            value={stats.playTime}
            subValue={`${stats.days}일차`}
            color="blue"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<Award className="w-5 h-5 text-yellow-400" />}
            label="레벨"
            value={stats.level}
            subValue={`경험치: ${stats.experience}`}
            color="yellow"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<Leaf className="w-5 h-5 text-green-400" />}
            label="수확 가능"
            value={stats.harvestablecrops}
            subValue="지금 수확할 수 있는 작물"
            color="green"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Crop Statistics */}
      {stats.cropStats.length > 0 && (
        <FadeIn delay={0.3}>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              🌾 작물별 수확 통계
            </h3>
            <div className="space-y-2">
              {stats.cropStats.map(([cropId, count]) => (
                <CropStat
                  key={cropId}
                  cropId={cropId}
                  count={count}
                  total={stats.totalCropsGrown}
                />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700 text-center">
              <span className="text-slate-400">총 </span>
              <span className="text-white font-semibold">{stats.totalCropsGrown}</span>
              <span className="text-slate-400">개 작물 수확</span>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
});

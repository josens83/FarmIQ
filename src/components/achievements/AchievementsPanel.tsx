import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Check } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { achievements, checkAchievementProgress, type Achievement } from '../../data/achievements';
import { FadeIn, StaggerContainer, StaggerItem } from '../common/AnimatedCard';
import { ProgressBar } from '../common';

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  progress: number;
  max: number;
}

const AchievementCard = memo<AchievementCardProps>(function AchievementCard({
  achievement,
  unlocked,
  progress,
  max
}) {
  const progressPercent = (progress / max) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative p-4 rounded-xl border transition-colors ${
        unlocked
          ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30'
          : 'bg-slate-800/50 border-slate-700/50'
      }`}
    >
      {/* Icon */}
      <div className="flex items-start gap-3">
        <div
          className={`text-3xl p-2 rounded-lg ${
            unlocked ? 'bg-green-500/20' : 'bg-slate-700/50 grayscale opacity-50'
          }`}
        >
          {achievement.icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center gap-2">
            <h4 className={`font-semibold truncate ${unlocked ? 'text-white' : 'text-slate-400'}`}>
              {achievement.titleKo}
            </h4>
            {unlocked && (
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
            )}
          </div>

          {/* Description */}
          <p className={`text-sm mt-1 ${unlocked ? 'text-slate-300' : 'text-slate-500'}`}>
            {achievement.descriptionKo}
          </p>

          {/* Progress Bar */}
          {!unlocked && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">진행률</span>
                <span className="text-slate-400">
                  {progress.toLocaleString()} / {max.toLocaleString()}
                </span>
              </div>
              <ProgressBar
                value={progress}
                max={max}
                size="sm"
                color={progressPercent > 50 ? 'green' : 'blue'}
              />
            </div>
          )}

          {/* Reward */}
          {achievement.reward && (
            <div className="flex items-center gap-2 mt-2">
              {achievement.reward.xp && (
                <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  +{achievement.reward.xp} XP
                </span>
              )}
              {achievement.reward.money && (
                <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-300">
                  +${achievement.reward.money}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lock overlay for hidden achievements */}
      {achievement.hidden && !unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-xl">
          <Lock className="w-8 h-8 text-slate-600" />
        </div>
      )}
    </motion.div>
  );
});

interface CategoryTabProps {
  category: Achievement['category'];
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
  count: { unlocked: number; total: number };
}

const CategoryTab = memo<CategoryTabProps>(function CategoryTab({
  label,
  icon,
  isActive,
  onClick,
  count
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-green-600 text-white'
          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
      }`}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded ${
        isActive ? 'bg-green-500' : 'bg-slate-700'
      }`}>
        {count.unlocked}/{count.total}
      </span>
    </button>
  );
});

export const AchievementsPanel = memo(function AchievementsPanel() {
  const { statistics, money, level, achievements: unlockedAchievements } = usePlayerStore();
  const { equipment, automationRules } = useEquipmentStore();
  const [activeCategory, setActiveCategory] = React.useState<Achievement['category'] | 'all'>('all');

  const stats = useMemo(() => ({
    totalHarvests: statistics.totalHarvests,
    totalRevenue: statistics.totalRevenue,
    currentMoney: money,
    level,
    equipmentCount: equipment.length,
    automationRulesCount: automationRules.length,
    playTime: statistics.playTime,
    daysPlayed: statistics.daysPlayed,
    cropsGrown: statistics.cropsGrown,
    qualityHarvests: statistics.perfectHarvests || 0
  }), [statistics, money, level, equipment.length, automationRules.length]);

  const achievementsWithProgress = useMemo(() => {
    return achievements.map(achievement => {
      const isUnlocked = unlockedAchievements.includes(achievement.id);
      const { progress, max } = checkAchievementProgress(achievement, stats);
      return {
        achievement,
        unlocked: isUnlocked,
        progress,
        max
      };
    });
  }, [stats, unlockedAchievements]);

  const filteredAchievements = useMemo(() => {
    if (activeCategory === 'all') {
      return achievementsWithProgress;
    }
    return achievementsWithProgress.filter(a => a.achievement.category === activeCategory);
  }, [achievementsWithProgress, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, { unlocked: number; total: number }> = {
      all: { unlocked: 0, total: 0 }
    };

    achievementsWithProgress.forEach(({ achievement, unlocked }) => {
      const cat = achievement.category;
      if (!counts[cat]) {
        counts[cat] = { unlocked: 0, total: 0 };
      }
      counts[cat].total++;
      counts.all.total++;
      if (unlocked) {
        counts[cat].unlocked++;
        counts.all.unlocked++;
      }
    });

    return counts;
  }, [achievementsWithProgress]);

  const categories: { key: Achievement['category'] | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: '전체', icon: '🏆' },
    { key: 'farming', label: '농사', icon: '🌾' },
    { key: 'economy', label: '경제', icon: '💰' },
    { key: 'automation', label: '자동화', icon: '🤖' },
    { key: 'mastery', label: '숙련도', icon: '⭐' },
    { key: 'special', label: '특별', icon: '🎯' }
  ];

  return (
    <div className="p-4 space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            업적
          </h2>
          <div className="text-sm text-slate-400">
            {categoryCounts.all.unlocked} / {categoryCounts.all.total} 달성
          </div>
        </div>
      </FadeIn>

      {/* Category Tabs */}
      <FadeIn delay={0.1}>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <CategoryTab
              key={cat.key}
              category={cat.key as Achievement['category']}
              label={cat.label}
              icon={cat.icon}
              isActive={activeCategory === cat.key}
              onClick={() => setActiveCategory(cat.key)}
              count={categoryCounts[cat.key] || { unlocked: 0, total: 0 }}
            />
          ))}
        </div>
      </FadeIn>

      {/* Achievement Grid */}
      <StaggerContainer className="grid gap-3" staggerDelay={0.03}>
        {filteredAchievements.map(({ achievement, unlocked, progress, max }) => (
          <StaggerItem key={achievement.id}>
            <AchievementCard
              achievement={achievement}
              unlocked={unlocked}
              progress={progress}
              max={max}
            />
          </StaggerItem>
        ))}
      </StaggerContainer>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          이 카테고리에 업적이 없습니다.
        </div>
      )}
    </div>
  );
});

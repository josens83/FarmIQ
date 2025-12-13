import React from 'react';
import {
  Pause,
  Play,
  FastForward,
  Sun,
  Moon,
  Coins,
  Star,
  Clock,
  Zap
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { usePlayerStore } from '../../store/playerStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { getLevelProgress, getXpToNextLevel } from '../../data/config/levels';
import type { GameSpeed } from '../../types';

export const GameHUD: React.FC = () => {
  const { gameTime, setGameSpeed, togglePause } = useGameStore();
  const { money, experience, level } = usePlayerStore();
  const { totalEnergyUsed } = useEquipmentStore();

  const isNight = gameTime.hour >= 20 || gameTime.hour < 6;
  const levelProgress = getLevelProgress(experience);
  const xpToNext = getXpToNextLevel(experience);

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const speedButtons: { speed: GameSpeed; label: string }[] = [
    { speed: 1, label: '1x' },
    { speed: 2, label: '2x' },
    { speed: 4, label: '4x' },
    { speed: 8, label: '8x' }
  ];

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 px-4 py-2">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Logo and Time */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold text-green-400 hidden sm:block">FarmIQ</span>
          </div>

          <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2">
              {isNight ? (
                <Moon className="w-4 h-4 text-blue-400" />
              ) : (
                <Sun className="w-4 h-4 text-yellow-400" />
              )}
              <span className="text-white font-medium">
                Day {gameTime.day}
              </span>
            </div>
            <div className="w-px h-4 bg-slate-600" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-white font-mono">
                {formatTime(gameTime.hour, gameTime.minute)}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Time Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePause}
            className={`p-2 rounded-lg transition-colors ${
              gameTime.isPaused
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {gameTime.isPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            {speedButtons.map(({ speed, label }) => (
              <button
                key={speed}
                onClick={() => setGameSpeed(speed)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  gameTime.speed === speed && !gameTime.isPaused
                    ? 'bg-green-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {speed === 8 ? <FastForward className="w-4 h-4" /> : label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-4">
          {/* Money */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-medium">{formatMoney(money)}</span>
          </div>

          {/* Level & XP */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
            <Star className="w-4 h-4 text-purple-400" />
            <div className="flex flex-col">
              <span className="text-white font-medium text-sm">Lv.{level}</span>
              <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full transition-all duration-300"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Energy Usage */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-medium text-sm">
              {totalEnergyUsed.toFixed(1)} kWh
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

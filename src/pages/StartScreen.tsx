import React from 'react';
import { Play, BookOpen, Settings, Trophy, Github } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useEquipmentStore } from '../store/equipmentStore';
import { Button } from '../components/common';

interface StartScreenProps {
  onStartGame: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const { startNewGame, resetGame } = useGameStore();
  const { resetPlayer } = usePlayerStore();
  const { resetEquipment, addEquipment } = useEquipmentStore();

  const handleNewGame = () => {
    // Reset all stores
    resetGame();
    resetPlayer();
    resetEquipment();

    // Add starting equipment
    addEquipment('basic-heater');
    addEquipment('basic-cooler');
    addEquipment('basic-fan');

    // Start game
    startNewGame();
    onStartGame();
  };

  const handleContinue = () => {
    startNewGame();
    onStartGame();
  };

  // Check if there's saved game data
  const hasSavedGame = localStorage.getItem('farmiq-game-store') !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900/20 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="text-center mb-12">
        <div className="text-8xl mb-4 animate-bounce">🌱</div>
        <h1 className="text-5xl font-bold text-white mb-2">
          Farm<span className="text-green-400">IQ</span>
        </h1>
        <p className="text-xl text-slate-400">스마트팜 교육 시뮬레이션</p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-3xl">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-white mb-1">IoT 센서</h3>
          <p className="text-sm text-slate-400">실시간 환경 모니터링</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-semibold text-white mb-1">자동화</h3>
          <p className="text-sm text-slate-400">스마트 장비 제어</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">🌾</div>
          <h3 className="font-semibold text-white mb-1">작물 재배</h3>
          <p className="text-sm text-slate-400">다양한 작물 성장 시뮬레이션</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {hasSavedGame && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
            icon={<Play className="w-5 h-5" />}
            className="w-full"
          >
            이어하기
          </Button>
        )}
        <Button
          variant={hasSavedGame ? 'secondary' : 'primary'}
          size="lg"
          onClick={handleNewGame}
          icon={<Play className="w-5 h-5" />}
          className="w-full"
        >
          새 게임
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => window.open('https://github.com/josens83/FarmIQ', '_blank')}
          icon={<Github className="w-5 h-5" />}
          className="w-full"
        >
          GitHub
        </Button>
      </div>

      {/* Version */}
      <p className="mt-8 text-slate-500 text-sm">
        Version 1.0 • Made with Claude Code
      </p>

      {/* Educational Note */}
      <div className="mt-8 max-w-md text-center text-sm text-slate-500">
        <p>
          FarmIQ는 스마트팜 기술을 재미있게 배울 수 있는 교육용 시뮬레이션입니다.
          IoT 센서, 자동화 시스템, 작물 재배의 기본 원리를 배워보세요.
        </p>
      </div>
    </div>
  );
};

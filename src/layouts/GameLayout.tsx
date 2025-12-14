import React, { useEffect, useState, memo } from 'react';
import { X, BarChart3, Settings, PieChart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { GameHUD } from '../components/hud';
import { SensorDashboard, StatisticsDashboard } from '../components/dashboard';
import { FarmGrid } from '../components/farm';
import { ControlPanel } from '../components/controls';
import { TutorialOverlay } from '../components/tutorial';
import { useGameStore } from '../store/gameStore';
import { GameEngine } from '../game/engine/GameEngine';
import { Modal } from '../components/common';

export const GameLayout = memo(function GameLayout() {
  const { isGameStarted, tutorialProgress } = useGameStore();
  const [showMobilePanel, setShowMobilePanel] = useState<'sensors' | 'controls' | 'stats' | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Start/stop game engine
  useEffect(() => {
    if (isGameStarted) {
      GameEngine.start();
    }
    return () => {
      GameEngine.stop();
    };
  }, [isGameStarted]);

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Tutorial Overlay */}
      {tutorialProgress.isActive && <TutorialOverlay />}

      {/* Top HUD */}
      <div data-tutorial="time-control">
        <GameHUD />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop: Sensor Dashboard (Left Panel) */}
        <aside
          className="hidden lg:flex w-80 xl:w-96 flex-col border-r border-slate-700 bg-slate-800/50 overflow-hidden"
          data-tutorial="sensor-dashboard"
        >
          <SensorDashboard />
        </aside>

        {/* Center: Farm Grid */}
        <main className="flex-1 flex flex-col overflow-hidden" data-tutorial="farm-grid">
          <FarmGrid />
        </main>

        {/* Desktop: Control Panel (Right Panel) */}
        <aside
          className="hidden lg:flex w-80 xl:w-96 flex-col border-l border-slate-700 bg-slate-800/50 overflow-hidden"
          data-tutorial="equipment-panel"
        >
          <ControlPanel />
        </aside>
      </div>

      {/* Mobile: Bottom Navigation */}
      <nav className="lg:hidden flex items-center justify-around border-t border-slate-700 bg-slate-800 py-2 px-4">
        <button
          onClick={() => setShowMobilePanel(showMobilePanel === 'sensors' ? null : 'sensors')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
            showMobilePanel === 'sensors' ? 'bg-green-600 text-white' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs">센서</span>
        </button>
        <button
          onClick={() => setShowMobilePanel(showMobilePanel === 'stats' ? null : 'stats')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
            showMobilePanel === 'stats' ? 'bg-green-600 text-white' : 'text-slate-400'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-xs">통계</span>
        </button>
        <button
          onClick={() => setShowMobilePanel(showMobilePanel === 'controls' ? null : 'controls')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
            showMobilePanel === 'controls' ? 'bg-green-600 text-white' : 'text-slate-400'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs">제어</span>
        </button>
      </nav>

      {/* Mobile: Slide-up Panel */}
      <AnimatePresence>
        {showMobilePanel && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="lg:hidden fixed inset-x-0 bottom-14 h-[60vh] bg-slate-800 border-t border-slate-700 rounded-t-2xl z-40 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <h3 className="font-semibold text-white">
                {showMobilePanel === 'sensors' ? '센서 대시보드' :
                 showMobilePanel === 'stats' ? '농장 통계' : '장비 제어'}
              </h3>
              <button
                onClick={() => setShowMobilePanel(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-[calc(100%-52px)] overflow-y-auto">
              {showMobilePanel === 'sensors' && <SensorDashboard />}
              {showMobilePanel === 'stats' && <StatisticsDashboard />}
              {showMobilePanel === 'controls' && <ControlPanel />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop: Statistics Modal */}
      <Modal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        title="농장 통계"
        size="lg"
      >
        <StatisticsDashboard />
      </Modal>
    </div>
  );
});

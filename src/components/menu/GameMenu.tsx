import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Settings,
  Trophy,
  BarChart3,
  Save,
  Download,
  Upload,
  HelpCircle,
  LogOut,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button, Modal } from '../common';
import { SettingsPanel } from '../settings';
import { AchievementsPanel } from '../achievements';
import { StatisticsDashboard } from '../dashboard';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';
import { downloadSaveFile } from '../../utils/saveGame';

type MenuTab = 'stats' | 'achievements' | 'settings';

interface GameMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameMenu = memo<GameMenuProps>(function GameMenu({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState<MenuTab>('stats');
  const { settings, updateSettings } = usePlayerStore();
  const { addNotification, skipTutorial, tutorialProgress } = useGameStore();

  const handleQuickSave = useCallback(() => {
    downloadSaveFile();
    addNotification({
      type: 'success',
      title: '저장 완료',
      message: '게임이 저장되었습니다.'
    });
  }, [addNotification]);

  const handleRestartTutorial = useCallback(() => {
    useGameStore.setState({
      tutorialProgress: {
        currentStep: 0,
        completedSteps: [],
        isActive: true
      }
    });
    onClose();
  }, [onClose]);

  const tabs: { id: MenuTab; label: string; icon: React.ReactNode }[] = [
    { id: 'stats', label: '통계', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'achievements', label: '업적', icon: <Trophy className="w-5 h-5" /> },
    { id: 'settings', label: '설정', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="게임 메뉴" size="lg">
      <div className="flex flex-col h-[70vh]">
        {/* Quick Actions */}
        <div className="flex items-center gap-2 pb-4 border-b border-slate-700">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleQuickSave}
            icon={<Save className="w-4 h-4" />}
          >
            빠른 저장
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            icon={settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          >
            {settings.soundEnabled ? '음소거' : '소리 켜기'}
          </Button>
          {!tutorialProgress.isActive && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRestartTutorial}
              icon={<HelpCircle className="w-4 h-4" />}
            >
              튜토리얼
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 py-3 border-b border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'stats' && <StatisticsDashboard />}
              {activeTab === 'achievements' && <AchievementsPanel />}
              {activeTab === 'settings' && <SettingsPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
});

import React, { memo, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Volume2,
  VolumeX,
  Music,
  Bell,
  BellOff,
  Globe,
  Download,
  Upload,
  Trash2,
  Save,
  AlertTriangle
} from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { useGameStore } from '../../store/gameStore';
import { Button, Modal } from '../common';
import { downloadSaveFile, loadSaveFile, resetAllGameData, getSaveFileInfo, type SaveGameData } from '../../utils/saveGame';
import { FadeIn, StaggerContainer, StaggerItem } from '../common/AnimatedCard';

interface SettingToggleProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
}

const SettingToggle = memo<SettingToggleProps>(function SettingToggle({
  icon,
  label,
  description,
  enabled,
  onToggle
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-700/50">
          {icon}
        </div>
        <div>
          <div className="text-white font-medium">{label}</div>
          {description && (
            <div className="text-sm text-slate-400">{description}</div>
          )}
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-green-500' : 'bg-slate-600'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
          animate={{ left: enabled ? '28px' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
});

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
}

const LanguageSelector = memo<LanguageSelectorProps>(function LanguageSelector({
  currentLanguage,
  onLanguageChange
}) {
  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  return (
    <div className="p-3 rounded-lg bg-slate-800/50">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-slate-700/50">
          <Globe className="w-5 h-5 text-blue-400" />
        </div>
        <div className="text-white font-medium">언어 / Language</div>
      </div>
      <div className="flex gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
              currentLanguage === lang.code
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

export const SettingsPanel = memo(function SettingsPanel() {
  const { settings, updateSettings } = usePlayerStore();
  const { addNotification } = useGameStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importPreview, setImportPreview] = useState<ReturnType<typeof getSaveFileInfo> | null>(null);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);

  const handleExport = useCallback(() => {
    downloadSaveFile();
    addNotification({
      type: 'success',
      title: '저장 완료',
      message: '게임 데이터가 파일로 저장되었습니다.'
    });
  }, [addNotification]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read file for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content) as SaveGameData;
        const info = getSaveFileInfo(data);
        if (info) {
          setImportPreview(info);
          setPendingImportFile(file);
        } else {
          addNotification({
            type: 'error',
            title: '불러오기 실패',
            message: '유효하지 않은 저장 파일입니다.'
          });
        }
      } catch {
        addNotification({
          type: 'error',
          title: '불러오기 실패',
          message: '파일을 읽을 수 없습니다.'
        });
      }
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  }, [addNotification]);

  const handleConfirmImport = useCallback(async () => {
    if (!pendingImportFile) return;

    const success = await loadSaveFile(pendingImportFile);
    if (success) {
      addNotification({
        type: 'success',
        title: '불러오기 완료',
        message: '게임 데이터를 성공적으로 불러왔습니다.'
      });
    } else {
      addNotification({
        type: 'error',
        title: '불러오기 실패',
        message: '게임 데이터를 불러오는데 실패했습니다.'
      });
    }
    setImportPreview(null);
    setPendingImportFile(null);
  }, [pendingImportFile, addNotification]);

  const handleReset = useCallback(() => {
    resetAllGameData();
    setShowResetConfirm(false);
    addNotification({
      type: 'info',
      title: '초기화 완료',
      message: '모든 게임 데이터가 초기화되었습니다.'
    });
    // Reload page to reset state
    window.location.reload();
  }, [addNotification]);

  const handleLanguageChange = useCallback((lang: string) => {
    updateSettings({ language: lang as 'ko' | 'en' });
    // Update i18n language
    import('../../i18n').then((i18n) => {
      i18n.default.changeLanguage(lang);
    });
  }, [updateSettings]);

  return (
    <div className="p-4 space-y-6">
      <FadeIn>
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
          <Settings className="w-6 h-6 text-slate-400" />
          설정
        </h2>
      </FadeIn>

      {/* Sound & Notifications */}
      <StaggerContainer className="space-y-2" staggerDelay={0.05}>
        <StaggerItem>
          <SettingToggle
            icon={settings.soundEnabled ? <Volume2 className="w-5 h-5 text-green-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
            label="효과음"
            description="게임 효과음 켜기/끄기"
            enabled={settings.soundEnabled}
            onToggle={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          />
        </StaggerItem>
        <StaggerItem>
          <SettingToggle
            icon={<Music className="w-5 h-5 text-purple-400" />}
            label="배경 음악"
            description="배경 음악 켜기/끄기"
            enabled={settings.musicEnabled}
            onToggle={() => updateSettings({ musicEnabled: !settings.musicEnabled })}
          />
        </StaggerItem>
        <StaggerItem>
          <SettingToggle
            icon={settings.notificationsEnabled ? <Bell className="w-5 h-5 text-yellow-400" /> : <BellOff className="w-5 h-5 text-slate-400" />}
            label="알림"
            description="게임 내 알림 켜기/끄기"
            enabled={settings.notificationsEnabled}
            onToggle={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Language */}
      <FadeIn delay={0.2}>
        <LanguageSelector
          currentLanguage={settings.language}
          onLanguageChange={handleLanguageChange}
        />
      </FadeIn>

      {/* Save/Load */}
      <FadeIn delay={0.3}>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Save className="w-5 h-5 text-blue-400" />
            저장 관리
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={handleExport}
              icon={<Download className="w-4 h-4" />}
              className="w-full"
            >
              내보내기
            </Button>
            <Button
              variant="secondary"
              onClick={handleImportClick}
              icon={<Upload className="w-4 h-4" />}
              className="w-full"
            >
              불러오기
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </FadeIn>

      {/* Reset */}
      <FadeIn delay={0.4}>
        <div className="pt-4 border-t border-slate-700">
          <Button
            variant="danger"
            onClick={() => setShowResetConfirm(true)}
            icon={<Trash2 className="w-4 h-4" />}
            className="w-full"
          >
            게임 초기화
          </Button>
          <p className="text-xs text-slate-500 mt-2 text-center">
            모든 게임 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
      </FadeIn>

      {/* Import Preview Modal */}
      <Modal
        isOpen={!!importPreview}
        onClose={() => {
          setImportPreview(null);
          setPendingImportFile(null);
        }}
        title="저장 파일 불러오기"
        size="sm"
      >
        {importPreview && (
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">저장 날짜:</span>
                <span className="text-white">{importPreview.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">레벨:</span>
                <span className="text-white">{importPreview.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">자금:</span>
                <span className="text-green-400">${importPreview.money.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">게임 일:</span>
                <span className="text-white">{importPreview.day}일차</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">플레이 시간:</span>
                <span className="text-white">{importPreview.playTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <p className="text-sm text-yellow-200">
                현재 게임 데이터가 덮어쓰여집니다.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setImportPreview(null);
                  setPendingImportFile(null);
                }}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmImport}
                className="flex-1"
              >
                불러오기
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="게임 초기화"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">정말 초기화하시겠습니까?</p>
              <p className="text-sm text-slate-400 mt-1">
                모든 진행 상황, 작물, 장비, 자금이 삭제됩니다.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowResetConfirm(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleReset}
              className="flex-1"
            >
              초기화
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

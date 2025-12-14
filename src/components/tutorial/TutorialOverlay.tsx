import React, { useEffect, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, SkipForward } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { tutorialSteps, getTutorialStep } from '../../data/tutorial';
import { Button } from '../common';

interface TutorialOverlayProps {
  onComplete?: () => void;
}

export const TutorialOverlay = memo<TutorialOverlayProps>(function TutorialOverlay({
  onComplete
}) {
  const { tutorialProgress, advanceTutorial, skipTutorial } = useGameStore();
  const [highlightedElement, setHighlightedElement] = useState<DOMRect | null>(null);

  const currentStep = getTutorialStep(tutorialProgress.currentStep);
  const isLastStep = tutorialProgress.currentStep >= tutorialSteps.length - 1;
  const isFirstStep = tutorialProgress.currentStep === 0;

  // Find and highlight element
  useEffect(() => {
    if (!currentStep?.highlight) {
      setHighlightedElement(null);
      return;
    }

    const element = document.querySelector(currentStep.highlight);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightedElement(rect);

      // Scroll into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep?.highlight]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      skipTutorial();
      onComplete?.();
    } else {
      advanceTutorial();
    }
  }, [isLastStep, advanceTutorial, skipTutorial, onComplete]);

  const handleSkip = useCallback(() => {
    skipTutorial();
    onComplete?.();
  }, [skipTutorial, onComplete]);

  // Don't render if tutorial is not active
  if (!tutorialProgress.isActive || !currentStep) {
    return null;
  }

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!highlightedElement) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    switch (currentStep.position) {
      case 'top':
        return {
          bottom: `${window.innerHeight - highlightedElement.top + padding}px`,
          left: `${highlightedElement.left + highlightedElement.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'bottom':
        return {
          top: `${highlightedElement.bottom + padding}px`,
          left: `${highlightedElement.left + highlightedElement.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          top: `${highlightedElement.top + highlightedElement.height / 2}px`,
          right: `${window.innerWidth - highlightedElement.left + padding}px`,
          transform: 'translateY(-50%)'
        };
      case 'right':
        return {
          top: `${highlightedElement.top + highlightedElement.height / 2}px`,
          left: `${highlightedElement.right + padding}px`,
          transform: 'translateY(-50%)'
        };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-label="튜토리얼"
      >
        {/* Overlay with hole for highlighted element */}
        <div className="absolute inset-0 pointer-events-auto">
          {highlightedElement ? (
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <mask id="tutorial-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <rect
                    x={highlightedElement.left - 8}
                    y={highlightedElement.top - 8}
                    width={highlightedElement.width + 16}
                    height={highlightedElement.height + 16}
                    rx="8"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.75)"
                mask="url(#tutorial-mask)"
              />
            </svg>
          ) : (
            <div className="absolute inset-0 bg-black/75" />
          )}
        </div>

        {/* Highlight border animation */}
        {highlightedElement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute pointer-events-none"
            style={{
              left: highlightedElement.left - 8,
              top: highlightedElement.top - 8,
              width: highlightedElement.width + 16,
              height: highlightedElement.height + 16
            }}
          >
            <div className="absolute inset-0 rounded-lg border-2 border-green-400 animate-pulse" />
            <div className="absolute inset-0 rounded-lg shadow-[0_0_20px_rgba(74,222,128,0.5)]" />
          </motion.div>
        )}

        {/* Tooltip */}
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="absolute w-80 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl pointer-events-auto"
          style={getTooltipPosition()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-2xl">📖</span>
              <h3 className="font-semibold text-white">{currentStep.titleKo}</h3>
            </div>
            <button
              onClick={handleSkip}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="튜토리얼 건너뛰기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-slate-300 text-sm leading-relaxed">
              {currentStep.contentKo}
            </p>
          </div>

          {/* Progress & Actions */}
          <div className="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-800/50 rounded-b-xl">
            <div className="flex items-center gap-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === tutorialProgress.currentStep
                      ? 'bg-green-400'
                      : index < tutorialProgress.currentStep
                      ? 'bg-green-600'
                      : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSkip}
                icon={<SkipForward className="w-4 h-4" />}
              >
                건너뛰기
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                {isLastStep ? '완료' : '다음'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

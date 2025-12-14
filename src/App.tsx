import { useState, useEffect, Suspense, lazy } from 'react';
import { useGameStore } from './store/gameStore';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './i18n';

// Lazy load heavy components for code splitting
const GameLayout = lazy(() => import('./layouts/GameLayout').then(m => ({ default: m.GameLayout })));
const StartScreen = lazy(() => import('./pages/StartScreen').then(m => ({ default: m.StartScreen })));

// Loading component for Suspense fallback
function LoadingScreen() {
  return (
    <div
      className="min-h-screen bg-gray-900 flex items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-lg">Loading FarmIQ...</p>
      </div>
    </div>
  );
}

function App() {
  const { isGameStarted } = useGameStore();
  const [showGame, setShowGame] = useState(false);

  // Check if game was already started (from saved state)
  useEffect(() => {
    if (isGameStarted) {
      setShowGame(true);
    }
  }, [isGameStarted]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        {!showGame ? (
          <StartScreen onStartGame={() => setShowGame(true)} />
        ) : (
          <GameLayout />
        )}
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;

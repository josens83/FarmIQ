import React, { useState, useEffect } from 'react';
import { GameLayout } from './layouts/GameLayout';
import { StartScreen } from './pages/StartScreen';
import { useGameStore } from './store/gameStore';

function App() {
  const { isGameStarted } = useGameStore();
  const [showGame, setShowGame] = useState(false);

  // Check if game was already started (from saved state)
  useEffect(() => {
    if (isGameStarted) {
      setShowGame(true);
    }
  }, [isGameStarted]);

  if (!showGame) {
    return <StartScreen onStartGame={() => setShowGame(true)} />;
  }

  return <GameLayout />;
}

export default App;

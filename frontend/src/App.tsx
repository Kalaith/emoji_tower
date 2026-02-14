import React from 'react';
import { GameHeader } from './components/GameHeader';
import { GameCanvas } from './components/GameCanvas';
import { GameControls } from './components/GameControls';
import { TowerPanel } from './components/TowerPanel';
import { GameOverModal } from './components/GameOverModal';
import { useGameLoop } from './hooks/useGameLoop';
import { useMapLoader } from './hooks/useMapLoader';

const App: React.FC = () => {
  useMapLoader();
  useGameLoop();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        <GameHeader />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            <GameCanvas />
            <GameControls />
          </div>

          <TowerPanel />
        </div>

        <GameOverModal />
      </div>
    </div>
  );
};

export default App;

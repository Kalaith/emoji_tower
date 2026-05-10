import React from 'react';
import { Button } from './ui/Button';
import { useGameStore } from '../stores/gameStore';

export const GameControls: React.FC = () => {
  const { waveInProgress, isPaused, gameSpeed, startWave, pauseGame, toggleSpeed, resetGame } =
    useGameStore();

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to reset the game? All progress will be lost.')) {
      void resetGame();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      <Button onClick={() => void startWave()} disabled={waveInProgress} variant="primary">
        {waveInProgress ? 'Wave In Progress' : 'Start Wave'}
      </Button>

      <Button onClick={() => void pauseGame()} variant="secondary">
        {isPaused ? 'Resume' : 'Pause'}
      </Button>

      <Button onClick={() => void toggleSpeed()} variant="outline">
        Speed: {gameSpeed}x
      </Button>

      <Button onClick={handleResetGame} variant="danger">
        Reset Game
      </Button>
    </div>
  );
};

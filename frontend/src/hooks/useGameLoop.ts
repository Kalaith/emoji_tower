import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';

export const useGameLoop = () => {
  const { isPaused, gameOver, waveInProgress, tickGame } = useGameStore();
  const isTickingRef = useRef(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (isPaused || gameOver || (!waveInProgress && useGameStore.getState().enemies.length === 0)) {
        return;
      }

      if (isTickingRef.current) {
        return;
      }

      isTickingRef.current = true;
      void tickGame().finally(() => {
        isTickingRef.current = false;
      });
    }, 120);

    return () => window.clearInterval(interval);
  }, [gameOver, isPaused, tickGame, waveInProgress]);
};

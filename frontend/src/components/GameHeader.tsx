import React from "react";
import { useGameStore } from "../stores/gameStore";

export const GameHeader: React.FC = () => {
  const { gold, xp, lives, wave } = useGameStore();

  return (
    <header className="p-4 border-b border-gray-200 mb-4">
      <h1 className="text-3xl font-semibold text-center mb-4">
        🏰 Emoji Tower Defense
      </h1>

      <div className="flex justify-center gap-6 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium">
          <span className="text-lg">💰</span>
          <span>{gold}</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium">
          <span className="text-lg">⭐</span>
          <span>{xp}</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium">
          <span className="text-lg">❤️</span>
          <span>{lives}</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium">
          <span className="text-lg">🌊</span>
          <span>Wave {wave}</span>
        </div>
      </div>
    </header>
  );
};

import React from "react";
import { useGameStore } from "../stores/gameStore";
import { gameData } from "../data/gameData";
import { Button } from "./ui/Button";

export const GameOverModal: React.FC = () => {
  const {
    gameOver,
    wave,
    xp,
    upgradeLevels,
    spendXP,
    upgradeLevel,
    restartGame,
  } = useGameStore();

  if (!gameOver) return null;

  const handleUpgrade = (upgradeName: string, cost: number) => {
    if (spendXP(cost)) {
      upgradeLevel(upgradeName);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-200">
        <h2 className="text-2xl font-semibold text-center mb-6">
          💀 Game Over!
        </h2>

        <div className="bg-gray-100 p-4 rounded-lg mb-6 text-center">
          <p className="mb-2">
            Wave Reached: <span className="font-medium">{wave}</span>
          </p>
          <p className="mb-2">
            XP Earned: ⭐<span className="font-medium">{xp}</span>
          </p>
          <p>
            Total XP: ⭐<span className="font-medium">{xp}</span>
          </p>
        </div>

        <h3 className="text-xl font-semibold mb-4">🚀 Upgrades</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {gameData.upgrades.map((upgrade) => {
            const level = upgradeLevels[upgrade.name];
            const cost = Math.floor(upgrade.baseCost * Math.pow(1.5, level));
            const canAfford = xp >= cost;

            return (
              <div
                key={upgrade.name}
                className="border border-gray-200 rounded-lg p-4 bg-white"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{upgrade.emoji}</span>
                  <span className="font-medium">{upgrade.name}</span>
                  <span className="text-sm text-gray-500 ml-auto">
                    Lv.{level}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  {upgrade.description}
                </div>

                <Button
                  onClick={() => handleUpgrade(upgrade.name, cost)}
                  disabled={!canAfford}
                  variant={canAfford ? "primary" : "outline"}
                  size="sm"
                  fullWidth
                >
                  {canAfford ? `Upgrade (⭐${cost})` : `Need ⭐${cost}`}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button onClick={restartGame} variant="primary" size="lg">
            🔄 Restart Run
          </Button>
        </div>
      </div>
    </div>
  );
};

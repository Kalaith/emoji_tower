import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { gameData } from '../data/gameData';
import type { TowerType } from '../types';
import { cn } from '../utils/cn';

export const TowerPanel: React.FC = () => {
  const {
    gold,
    selectedTowerType,
    upgradeLevels,
    selectTowerType
  } = useGameStore();

  const handleSelectTower = (towerType: TowerType) => {
    if (gold >= towerType.cost) {
      selectTowerType(towerType);
    }
  };

  const getModifiedStats = (tower: TowerType) => {
    const damageMultiplier = 1 + upgradeLevels["Tower Damage"] * gameData.upgrades[0].effect;
    const rangeMultiplier = 1 + upgradeLevels["Tower Range"] * gameData.upgrades[1].effect;
    
    return {
      damage: Math.floor(tower.damage * damageMultiplier),
      range: Math.floor(tower.range * rangeMultiplier)
    };
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 h-fit">
      <h3 className="text-xl font-semibold text-center mb-4">🏗️ Towers</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        {gameData.towerTypes.map((tower) => {
          const canAfford = gold >= tower.cost;
          const isSelected = selectedTowerType?.name === tower.name;
          
          return (
            <div
              key={tower.name}
              className={cn(
                "flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all text-center",
                isSelected && canAfford && "border-blue-600 bg-blue-600 text-white animate-pulse",
                !isSelected && canAfford && "border-gray-300 bg-white hover:border-blue-600 hover:bg-gray-50",
                !canAfford && "border-gray-300 bg-white opacity-50 cursor-not-allowed"
              )}
              onClick={() => handleSelectTower(tower)}
            >
              <div className="text-2xl mb-1">{tower.emoji}</div>
              <div className="font-medium text-sm mb-1">{tower.name}</div>
              <div className="text-xs text-gray-600">💰{tower.cost}</div>
            </div>
          );
        })}
      </div>

      {selectedTowerType && (
        <div className="border border-gray-200 rounded-lg p-4 mb-5">
          <h4 className="font-semibold mb-3">Selected Tower</h4>
          <div className="flex gap-3 mb-3">
            <div className="text-3xl">{selectedTowerType.emoji}</div>
            <div className="flex-1 text-sm">
              <div className="mb-1">
                <strong>Damage:</strong> {getModifiedStats(selectedTowerType).damage}
              </div>
              <div className="mb-1">
                <strong>Range:</strong> {getModifiedStats(selectedTowerType).range}
              </div>
              <div className="mb-1">
                <strong>Speed:</strong> {selectedTowerType.speed}ms
              </div>
              <div className="mb-1">
                <strong>Cost:</strong> 💰{selectedTowerType.cost}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">{selectedTowerType.description}</p>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold mb-2">🌊 Next Wave</h4>
        <div className="flex gap-2 mt-2 flex-wrap">
          {gameData.enemyTypes.slice(0, 3).map((enemy, index) => (
            <div
              key={index}
              className="text-xl p-1 rounded bg-gray-100"
              title={enemy.description}
            >
              {enemy.emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
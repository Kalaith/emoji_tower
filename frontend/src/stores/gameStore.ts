import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { GameState, Tower, Enemy, Projectile, TowerType, PathPoint, GameMap } from '../types';
import { gameData } from '../data/gameData';

interface GameStore extends GameState {
  // Actions
  setGameMap: (gameMap: GameMap) => void;
  setEnemyPath: (enemyPath: PathPoint[]) => void;
  selectTowerType: (towerType: TowerType | null) => void;
  placeTower: (x: number, y: number) => boolean;
  startWave: () => void;
  pauseGame: () => void;
  toggleSpeed: () => void;
  resetGame: () => void;
  restartGame: () => void;
  updateGame: () => void;
  addTower: (tower: Tower) => void;
  addEnemy: (enemy: Enemy) => void;
  addProjectile: (projectile: Projectile) => void;
  removeTower: (index: number) => void;
  removeEnemy: (index: number) => void;
  removeProjectile: (index: number) => void;
  updateTowers: (towers: Tower[]) => void;
  updateEnemies: (enemies: Enemy[]) => void;
  updateProjectiles: (projectiles: Projectile[]) => void;
  takeDamage: (damage: number) => void;
  earnGold: (amount: number) => void;
  earnXP: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  spendXP: (amount: number) => boolean;
  upgradeLevel: (upgradeName: string) => void;
  setWaveInProgress: (inProgress: boolean) => void;
  setGameOver: (gameOver: boolean) => void;
  nextWave: () => void;
}

const initialState: GameState = {
  gold: gameData.gameSettings.startingGold,
  xp: 0,
  lives: gameData.gameSettings.startingLives,
  wave: 1,
  gameSpeed: 1,
  isPaused: false,
  selectedTowerType: null,
  towers: [],
  enemies: [],
  projectiles: [],
  waveInProgress: false,
  gameOver: false,
  upgradeLevels: {
    "Tower Damage": 0,
    "Tower Range": 0,
    "Starting Gold": 0,
    "XP Multiplier": 0,
    "Wave Delay": 0,
    "Auto-Start": 0
  },
  enemyPath: [],
  gameMap: null
};

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setGameMap: (gameMap) => set({ gameMap }),

        setEnemyPath: (enemyPath) => set({ enemyPath }),

        selectTowerType: (towerType) => set({ selectedTowerType: towerType }),

        placeTower: (x, y) => {
          const state = get();
          const { selectedTowerType, gameMap, towers, gold } = state;
          
          if (!selectedTowerType || !gameMap || gold < selectedTowerType.cost) {
            return false;
          }

          const { map, tileSize } = gameMap;
          const gridX = Math.floor(x / tileSize);
          const gridY = Math.floor(y / tileSize);

          // Check bounds
          if (gridY < 0 || gridY >= map.length || gridX < 0 || gridX >= map[0].length) {
            return false;
          }

          // Check if position is free
          if (map[gridY][gridX] !== "free") {
            return false;
          }

          // Check if space is occupied
          const towerX = gridX * tileSize + tileSize / 2;
          const towerY = gridY * tileSize + tileSize / 2;
          
          const isOccupied = towers.some(tower => 
            tower.x === towerX && tower.y === towerY
          );

          if (isOccupied) {
            return false;
          }

          // Create tower with upgrades applied
          const rangeMultiplier = 1 + state.upgradeLevels["Tower Range"] * gameData.upgrades[1].effect;
          const damageMultiplier = 1 + state.upgradeLevels["Tower Damage"] * gameData.upgrades[0].effect;

          const tower: Tower = {
            x: towerX,
            y: towerY,
            type: selectedTowerType,
            lastShot: 0,
            range: selectedTowerType.range * rangeMultiplier,
            damage: selectedTowerType.damage * damageMultiplier
          };

          set(state => ({
            towers: [...state.towers, tower],
            gold: state.gold - selectedTowerType.cost
          }));

          return true;
        },

        startWave: () => {
          const state = get();
          if (!state.waveInProgress) {
            set({ waveInProgress: true });
          }
        },

        pauseGame: () => set(state => ({ isPaused: !state.isPaused })),

        toggleSpeed: () => set(state => ({ 
          gameSpeed: state.gameSpeed === 1 ? 2 : state.gameSpeed === 2 ? 4 : 1 
        })),

        resetGame: () => set(initialState),

        restartGame: () => {
          const state = get();
          const startingGoldBonus = state.upgradeLevels["Starting Gold"] * gameData.upgrades[2].effect;
          
          set({
            ...initialState,
            gold: gameData.gameSettings.startingGold + startingGoldBonus,
            upgradeLevels: state.upgradeLevels,
            xp: state.xp,
            gameMap: state.gameMap,
            enemyPath: state.enemyPath
          });
        },

        updateGame: () => {
          // This will be called from the game loop
          // Tower, enemy, and projectile updates will be handled in the components
        },

        addTower: (tower) => set(state => ({ towers: [...state.towers, tower] })),

        addEnemy: (enemy) => set(state => ({ enemies: [...state.enemies, enemy] })),

        addProjectile: (projectile) => set(state => ({ projectiles: [...state.projectiles, projectile] })),

        removeTower: (index) => set(state => ({ 
          towers: state.towers.filter((_, i) => i !== index) 
        })),

        removeEnemy: (index) => set(state => ({ 
          enemies: state.enemies.filter((_, i) => i !== index) 
        })),

        removeProjectile: (index) => set(state => ({ 
          projectiles: state.projectiles.filter((_, i) => i !== index) 
        })),

        updateTowers: (towers) => set({ towers }),

        updateEnemies: (enemies) => set({ enemies }),

        updateProjectiles: (projectiles) => set({ projectiles }),

        takeDamage: (damage) => set(state => {
          const newLives = Math.max(0, state.lives - damage);
          return {
            lives: newLives,
            gameOver: newLives <= 0
          };
        }),

        earnGold: (amount) => set(state => ({ gold: state.gold + amount })),

        earnXP: (amount) => {
          const state = get();
          const xpMultiplier = 1 + state.upgradeLevels["XP Multiplier"] * gameData.upgrades[3].effect;
          const finalAmount = Math.floor(amount * xpMultiplier);
          set(state => ({ xp: state.xp + finalAmount }));
        },

        spendGold: (amount) => {
          const state = get();
          if (state.gold >= amount) {
            set(state => ({ gold: state.gold - amount }));
            return true;
          }
          return false;
        },

        spendXP: (amount) => {
          const state = get();
          if (state.xp >= amount) {
            set(state => ({ xp: state.xp - amount }));
            return true;
          }
          return false;
        },

        upgradeLevel: (upgradeName) => set(state => ({
          upgradeLevels: {
            ...state.upgradeLevels,
            [upgradeName]: state.upgradeLevels[upgradeName] + 1
          }
        })),

        setWaveInProgress: (inProgress) => set({ waveInProgress: inProgress }),

        setGameOver: (gameOver) => set({ gameOver }),

        nextWave: () => set(state => ({ 
          wave: state.wave + 1,
          waveInProgress: false
        }))
      }),
      {
        name: 'emoji-tower-game-store',
        partialize: (state) => ({
          gold: state.gold,
          xp: state.xp,
          lives: state.lives,
          wave: state.wave,
          towers: state.towers,
          upgradeLevels: state.upgradeLevels
        })
      }
    )
  )
);
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { webhatcheryGameApi, type WebHatcheryGameState } from '../api/webhatcheryGameApi';
import type { Enemy, GameMap, GameState, PathPoint, Projectile, Tower, TowerType } from '../types';
import { useWebHatcherySessionStore } from './webhatcherySessionStore';

interface GameStore extends GameState {
  isLoading: boolean;
  error: string | null;
  initializeBackend: () => Promise<void>;
  selectTowerType: (towerType: TowerType | null) => Promise<void>;
  placeTower: (x: number, y: number) => Promise<boolean>;
  startWave: () => Promise<void>;
  pauseGame: () => Promise<void>;
  toggleSpeed: () => Promise<void>;
  resetGame: () => Promise<void>;
  restartGame: () => Promise<void>;
  buyUpgrade: (upgradeName: string) => Promise<boolean>;
  tickGame: () => Promise<void>;
  setGameMap: (gameMap: GameMap) => void;
  setEnemyPath: (enemyPath: PathPoint[]) => void;
  updateTowers: (towers: Tower[]) => void;
  updateEnemies: (enemies: Enemy[]) => void;
  updateProjectiles: (projectiles: Projectile[]) => void;
}

const initialState: GameState = {
  gold: 0,
  xp: 0,
  lives: 0,
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
    'Tower Damage': 0,
    'Tower Range': 0,
    'Starting Gold': 0,
    'XP Multiplier': 0,
    'Wave Delay': 0,
    'Auto-Start': 0,
  },
  enemyPath: [],
  gameMap: null,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const applyBackendGame = (set: (state: Partial<GameStore>) => void, game: WebHatcheryGameState): void => {
  const state = game.save.state;
  if (!isRecord(state)) {
    set({ isLoading: false, error: 'Backend returned an invalid game state.' });
    return;
  }

  set({
    gold: typeof state.gold === 'number' ? state.gold : 0,
    xp: typeof state.xp === 'number' ? state.xp : 0,
    lives: typeof state.lives === 'number' ? state.lives : 0,
    wave: typeof state.wave === 'number' ? state.wave : 1,
    gameSpeed: typeof state.gameSpeed === 'number' ? state.gameSpeed : 1,
    isPaused: state.isPaused === true,
    selectedTowerType: isRecord(state.selectedTowerType) ? (state.selectedTowerType as unknown as TowerType) : null,
    towers: Array.isArray(state.towers) ? (state.towers as Tower[]) : [],
    enemies: Array.isArray(state.enemies) ? (state.enemies as Enemy[]) : [],
    projectiles: Array.isArray(state.projectiles) ? (state.projectiles as Projectile[]) : [],
    waveInProgress: state.waveInProgress === true,
    gameOver: state.gameOver === true,
    upgradeLevels: isRecord(state.upgradeLevels)
      ? (state.upgradeLevels as Record<string, number>)
      : initialState.upgradeLevels,
    enemyPath: Array.isArray(state.enemyPath) ? (state.enemyPath as PathPoint[]) : [],
    gameMap: isRecord(state.gameMap) ? (state.gameMap as unknown as GameMap) : null,
    isLoading: false,
    error: null,
  });
};

const loadBackendGame = async (): Promise<WebHatcheryGameState> => {
  const session = useWebHatcherySessionStore.getState();
  try {
    return await session.loadGame();
  } catch {
    return await session.continueAsGuest();
  }
};

const runIntent = async (
  set: (state: Partial<GameStore>) => void,
  intent: string,
  payload: Record<string, unknown> = {},
): Promise<WebHatcheryGameState> => {
  set({ isLoading: true, error: null });
  const game = await webhatcheryGameApi.applyIntent(intent, payload);
  applyBackendGame(set, game);
  return game;
};

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        isLoading: false,
        error: null,

        initializeBackend: async () => {
          set({ isLoading: true, error: null });
          try {
            applyBackendGame(set, await loadBackendGame());
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to initialize game.';
            set({ isLoading: false, error: message });
          }
        },

        selectTowerType: async towerType => {
          try {
            await runIntent(set, 'select_tower_type', { towerName: towerType?.name ?? null });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to select tower.';
            set({ isLoading: false, error: message });
          }
        },

        placeTower: async (x, y) => {
          try {
            await runIntent(set, 'place_tower', { x, y });
            return true;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to place tower.';
            set({ isLoading: false, error: message });
            return false;
          }
        },

        startWave: async () => {
          try {
            await runIntent(set, 'start_wave');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to start wave.';
            set({ isLoading: false, error: message });
          }
        },

        pauseGame: async () => {
          try {
            await runIntent(set, 'pause_game');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to pause game.';
            set({ isLoading: false, error: message });
          }
        },

        toggleSpeed: async () => {
          try {
            await runIntent(set, 'toggle_speed');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to change speed.';
            set({ isLoading: false, error: message });
          }
        },

        resetGame: async () => {
          try {
            await runIntent(set, 'reset_game');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to reset game.';
            set({ isLoading: false, error: message });
          }
        },

        restartGame: async () => {
          try {
            await runIntent(set, 'restart_game');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to restart game.';
            set({ isLoading: false, error: message });
          }
        },

        buyUpgrade: async upgradeName => {
          try {
            await runIntent(set, 'buy_upgrade', { upgradeName });
            return true;
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to buy upgrade.';
            set({ isLoading: false, error: message });
            return false;
          }
        },

        tickGame: async () => {
          try {
            const game = await webhatcheryGameApi.applyIntent('tick');
            applyBackendGame(set, game);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to update game.';
            set({ isLoading: false, error: message });
          }
        },

        setGameMap: gameMap => set({ gameMap }),
        setEnemyPath: enemyPath => set({ enemyPath }),
        updateTowers: towers => set({ towers }),
        updateEnemies: enemies => set({ enemies }),
        updateProjectiles: projectiles => set({ projectiles }),
      }),
      {
        name: 'emoji-tower-game-store',
        partialize: state => ({
          gold: state.gold,
          xp: state.xp,
          lives: state.lives,
          wave: state.wave,
          towers: state.towers,
          upgradeLevels: state.upgradeLevels,
        }),
      }
    )
  )
);

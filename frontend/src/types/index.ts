export interface TowerType {
  name: string;
  emoji: string;
  damage: number;
  range: number;
  speed: number;
  cost: number;
  description: string;
}

export interface EnemyType {
  name: string;
  emoji: string;
  health: number;
  speed: number;
  reward: number;
  description: string;
}

export interface Upgrade {
  name: string;
  emoji: string;
  baseCost: number;
  effect: number;
  description: string;
}

export interface GameSettings {
  gridSize: number;
  canvasWidth: number;
  canvasHeight: number;
  startingGold: number;
  startingLives: number;
  waveScaling: number;
}

export interface GameMap {
  map: string[][];
  tileSize: number;
}

export interface GameData {
  towerTypes: TowerType[];
  enemyTypes: EnemyType[];
  upgrades: Upgrade[];
  gameSettings: GameSettings;
}

export interface Tower {
  x: number;
  y: number;
  type: TowerType;
  lastShot: number;
  range: number;
  damage: number;
}

export interface Enemy {
  x: number;
  y: number;
  type: EnemyType;
  health: number;
  maxHealth: number;
  speed: number;
  pathIndex: number;
  progress: number;
  slowEffect: number;
}

export interface Projectile {
  x: number;
  y: number;
  target: Enemy;
  damage: number;
  towerType: TowerType;
  speed: number;
}

export interface PathPoint {
  x: number;
  y: number;
}

export interface GameState {
  gold: number;
  xp: number;
  lives: number;
  wave: number;
  gameSpeed: number;
  isPaused: boolean;
  selectedTowerType: TowerType | null;
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  waveInProgress: boolean;
  gameOver: boolean;
  upgradeLevels: Record<string, number>;
  enemyPath: PathPoint[];
  gameMap: GameMap | null;
}

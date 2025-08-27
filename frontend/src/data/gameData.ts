import type { GameData } from '../types';

export const gameData: GameData = {
  towerTypes: [
    {
      name: "Archer",
      emoji: "🏹",
      damage: 25,
      range: 120,
      speed: 1000,
      cost: 50,
      description: "Basic tower with balanced stats"
    },
    {
      name: "Fire",
      emoji: "🔥",
      damage: 40,
      range: 80,
      speed: 1500,
      cost: 100,
      description: "Area damage, burns enemies"
    },
    {
      name: "Ice",
      emoji: "❄️",
      damage: 15,
      range: 100,
      speed: 800,
      cost: 75,
      description: "Slows enemies down"
    },
    {
      name: "Lightning",
      emoji: "⚡",
      damage: 100,
      range: 150,
      speed: 2500,
      cost: 200,
      description: "High damage, long range"
    },
    {
      name: "Bomb",
      emoji: "💣",
      damage: 200,
      range: 60,
      speed: 3000,
      cost: 300,
      description: "Massive area damage"
    }
  ],
  enemyTypes: [
    {
      name: "Frog",
      emoji: "🐸",
      health: 50,
      speed: 1,
      reward: 10,
      description: "Basic weak enemy"
    },
    {
      name: "Dog",
      emoji: "🐕",
      health: 30,
      speed: 1.5,
      reward: 15,
      description: "Fast but fragile"
    },
    {
      name: "Elephant",
      emoji: "🐘",
      health: 150,
      speed: 0.5,
      reward: 25,
      description: "Slow tank enemy"
    },
    {
      name: "Ghost",
      emoji: "👻",
      health: 80,
      speed: 1.2,
      reward: 20,
      description: "Can phase through some attacks"
    },
    {
      name: "Robot",
      emoji: "🤖",
      health: 120,
      speed: 0.8,
      reward: 30,
      description: "Immune to ice effects"
    }
  ],
  upgrades: [
    {
      name: "Tower Damage",
      emoji: "⚔️",
      baseCost: 100,
      effect: 0.1,
      description: "Increases all tower damage by 10%"
    },
    {
      name: "Tower Range",
      emoji: "🎯",
      baseCost: 150,
      effect: 0.05,
      description: "Increases all tower range by 5%"
    },
    {
      name: "Starting Gold",
      emoji: "💰",
      baseCost: 80,
      effect: 50,
      description: "Start each run with +50 gold"
    },
    {
      name: "XP Multiplier",
      emoji: "⭐",
      baseCost: 200,
      effect: 0.2,
      description: "Earn 20% more XP"
    },
    {
      name: "Wave Delay",
      emoji: "⏰",
      baseCost: 120,
      effect: 0.1,
      description: "10% delay between enemy spawns"
    },
    {
      name: "Auto-Start",
      emoji: "🚀",
      baseCost: 500,
      effect: 1,
      description: "Automatically start next wave"
    }
  ],
  gameSettings: {
    gridSize: 64,
    canvasWidth: 800,
    canvasHeight: 600,
    startingGold: 200,
    startingLives: 20,
    waveScaling: 1.15
  }
};
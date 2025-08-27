import React, { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { gameData } from '../data/gameData';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    gameMap,
    towers,
    enemies,
    projectiles,
    enemyPath,
    selectedTowerType,
    isPaused,
    placeTower
  } = useGameStore();

  const drawMap = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!gameMap) {
      ctx.fillStyle = '#f0d9b5';
      ctx.fillRect(0, 0, gameData.gameSettings.canvasWidth, gameData.gameSettings.canvasHeight);
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Loading map...', gameData.gameSettings.canvasWidth / 2, gameData.gameSettings.canvasHeight / 2);
      return;
    }

    const { map, tileSize } = gameMap;

    // Draw map tiles
    for (let r = 0; r < map.length; r++) {
      for (let c = 0; c < map[r].length; c++) {
        const cellType = map[r][c];
        let color = '#f0d9b5'; // Default for free space
        if (cellType === 'road') {
          color = '#8B4513'; // Brown road color
        } else if (cellType === 'obstacle') {
          color = '#5e5240'; // Obstacle color
        }
        ctx.fillStyle = color;
        ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
      }
    }

    // Draw grid lines
    ctx.strokeStyle = 'rgba(94, 82, 64, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < gameData.gameSettings.canvasWidth; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gameData.gameSettings.canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y < gameData.gameSettings.canvasHeight; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(gameData.gameSettings.canvasWidth, y);
      ctx.stroke();
    }

    // Draw path
    if (enemyPath.length > 0) {
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(enemyPath[0].x, enemyPath[0].y);
      for (let i = 1; i < enemyPath.length; i++) {
        ctx.lineTo(enemyPath[i].x, enemyPath[i].y);
      }
      ctx.stroke();
    }
  }, [gameMap, enemyPath]);

  const drawTowers = useCallback((ctx: CanvasRenderingContext2D) => {
    towers.forEach(tower => {
      ctx.save();
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'black';
      ctx.fillText(tower.type.emoji, tower.x, tower.y + 8);

      // Draw range when selected
      if (selectedTowerType && tower.type.name === selectedTowerType.name) {
        ctx.strokeStyle = 'rgba(33, 128, 141, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });
  }, [towers, selectedTowerType]);

  const drawEnemies = useCallback((ctx: CanvasRenderingContext2D) => {
    enemies.forEach(enemy => {
      if (!enemy.x || !enemy.y || isNaN(enemy.x) || isNaN(enemy.y)) return;

      ctx.save();

      // Draw health bar
      const barWidth = 30;
      const barHeight = 4;
      const healthPercent = Math.max(0, Math.min(1, enemy.health / enemy.maxHealth));

      ctx.fillStyle = 'red';
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - 20, barWidth, barHeight);
      ctx.fillStyle = 'green';
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - 20, barWidth * healthPercent, barHeight);

      // Draw enemy
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'black';
      ctx.fillText(enemy.type.emoji, enemy.x, enemy.y);

      ctx.restore();
    });
  }, [enemies]);

  const drawProjectiles = useCallback((ctx: CanvasRenderingContext2D) => {
    projectiles.forEach(projectile => {
      ctx.save();
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, [projectiles]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw game objects
    drawMap(ctx);
    drawTowers(ctx);
    drawEnemies(ctx);
    drawProjectiles(ctx);
  }, [drawMap, drawTowers, drawEnemies, drawProjectiles]);

  useEffect(() => {
    if (!isPaused) {
      draw();
    }
  }, [draw, isPaused, towers, enemies, projectiles, gameMap]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    placeTower(x, y);
  };

  return (
    <div className="flex flex-col gap-4">
      <canvas
        ref={canvasRef}
        width={gameData.gameSettings.canvasWidth}
        height={gameData.gameSettings.canvasHeight}
        className="border-2 border-gray-300 rounded-lg bg-white cursor-crosshair block"
        onClick={handleCanvasClick}
      />
    </div>
  );
};
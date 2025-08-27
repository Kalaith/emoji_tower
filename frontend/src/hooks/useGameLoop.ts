import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { gameData } from '../data/gameData';
import type { Enemy, Projectile, Tower } from '../types';

export const useGameLoop = () => {
  const {
    isPaused,
    gameOver,
    gameSpeed,
    waveInProgress,
    wave,
    towers,
    enemies,
    projectiles,
    enemyPath,
    upgradeLevels,
    removeEnemy,
    removeProjectile,
    earnGold,
    earnXP,
    takeDamage,
    setWaveInProgress,
    nextWave,
    addEnemy,
    addProjectile
  } = useGameStore();

  const gameLoopRef = useRef<number>(0);
  const lastWaveSpawnRef = useRef<number>(0);
  const waveEnemiesSpawnedRef = useRef<number>(0);

  const updateTower = useCallback((tower: Tower): void => {
    if (!tower || typeof tower !== 'object') return;

    const now = Date.now();
    if (now - tower.lastShot < tower.type.speed / gameSpeed) return;

    // Find closest enemy in range
    let closestEnemy: Enemy | null = null;
    let closestDistance = tower.range;

    enemies.forEach(enemy => {
      const distance = Math.sqrt((enemy.x - tower.x) ** 2 + (enemy.y - tower.y) ** 2);
      if (distance <= tower.range && distance < closestDistance) {
        closestEnemy = enemy;
        closestDistance = distance;
      }
    });

    if (closestEnemy) {
      tower.lastShot = now;
      const projectile: Projectile = {
        x: tower.x,
        y: tower.y,
        target: closestEnemy,
        damage: tower.damage,
        towerType: tower.type,
        speed: 5
      };
      addProjectile(projectile);
    }
  }, [enemies, gameSpeed, addProjectile]);

  const updateEnemy = useCallback((enemy: Enemy, index: number): boolean => {
    if (!enemy || enemyPath.length === 0) return false;

    const currentSpeed = enemy.speed * (1 - enemy.slowEffect) * gameSpeed;
    enemy.progress += currentSpeed;

    if (enemy.slowEffect > 0) {
      enemy.slowEffect -= 0.02;
    }

    // Move along path
    if (enemy.pathIndex < enemyPath.length - 1) {
      const current = enemyPath[enemy.pathIndex];
      const next = enemyPath[enemy.pathIndex + 1];
      const segmentLength = Math.sqrt((next.x - current.x) ** 2 + (next.y - current.y) ** 2);

      if (segmentLength === 0) {
        enemy.pathIndex++;
        return false;
      }

      if (enemy.progress >= segmentLength) {
        enemy.progress -= segmentLength;
        enemy.pathIndex++;

        if (enemy.pathIndex >= enemyPath.length - 1) {
          const finalPoint = enemyPath[enemyPath.length - 1];
          enemy.x = finalPoint.x;
          enemy.y = finalPoint.y;
          return false;
        }
      }

      // Calculate position between current and next waypoint
      if (enemy.pathIndex < enemyPath.length - 1) {
        const currentPoint = enemyPath[enemy.pathIndex];
        const nextPoint = enemyPath[enemy.pathIndex + 1];
        const currentSegmentLength = Math.sqrt((nextPoint.x - currentPoint.x) ** 2 + (nextPoint.y - currentPoint.y) ** 2);

        if (currentSegmentLength > 0) {
          const t = Math.min(enemy.progress / currentSegmentLength, 1);
          enemy.x = currentPoint.x + (nextPoint.x - currentPoint.x) * t;
          enemy.y = currentPoint.y + (nextPoint.y - currentPoint.y) * t;
        }
      }
    } else {
      // Continue moving off the map
      const lastPoint = enemyPath[enemyPath.length - 1];
      enemy.x = lastPoint.x + enemy.progress;

      // Check if enemy reached the end
      if (enemy.x > gameData.gameSettings.canvasWidth + 50) {
        takeDamage(1);
        removeEnemy(index);
        return true;
      }
    }

    return false;
  }, [enemyPath, gameSpeed, takeDamage, removeEnemy]);

  const updateProjectile = useCallback((projectile: Projectile, index: number): boolean => {
    if (!projectile.target || projectile.target.health <= 0) {
      removeProjectile(index);
      return true;
    }

    const dx = projectile.target.x - projectile.x;
    const dy = projectile.target.y - projectile.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    if (distance < 10) {
      // Hit target
      const target = projectile.target;
      target.health -= projectile.damage;

      // Special effects
      if (projectile.towerType.name === 'Ice' && target.type.name !== 'Robot') {
        target.slowEffect = Math.max(target.slowEffect, 0.5);
      }

      if (projectile.towerType.name === 'Fire' || projectile.towerType.name === 'Bomb') {
        // Area damage
        const areaRange = projectile.towerType.name === 'Fire' ? 50 : 80;
        enemies.forEach(enemy => {
          const areaDist = Math.sqrt((enemy.x - target.x) ** 2 + (enemy.y - target.y) ** 2);
          if (areaDist <= areaRange && enemy !== target) {
            enemy.health -= projectile.damage * 0.5;
          }
        });
      }

      if (target.health <= 0) {
        const goldReward = target.type.reward;
        const xpReward = Math.floor(target.type.reward * 0.5);
        earnGold(goldReward);
        earnXP(xpReward);

        const enemyIndex = enemies.findIndex(e => e === target);
        if (enemyIndex > -1) {
          removeEnemy(enemyIndex);
        }
      }

      removeProjectile(index);
      return true;
    }

    // Move towards target
    projectile.x += (dx / distance) * projectile.speed * gameSpeed;
    projectile.y += (dy / distance) * projectile.speed * gameSpeed;

    return false;
  }, [enemies, earnGold, earnXP, removeEnemy, removeProjectile, gameSpeed]);

  const spawnEnemies = useCallback(() => {
    if (!waveInProgress) return;

    const now = Date.now();
    const spawnDelay = 1000 / (1 + upgradeLevels["Wave Delay"] * gameData.upgrades[4].effect);
    const enemiesInWave = Math.min(5 + wave, 20);

    if (waveEnemiesSpawnedRef.current >= enemiesInWave) return;

    if (now - lastWaveSpawnRef.current >= spawnDelay) {
      // Select enemy type based on wave
      let enemyTypeIndex = 0;
      if (wave > 3) enemyTypeIndex = Math.floor(Math.random() * 2);
      if (wave > 6) enemyTypeIndex = Math.floor(Math.random() * 3);
      if (wave > 10) enemyTypeIndex = Math.floor(Math.random() * 4);
      if (wave > 15) enemyTypeIndex = Math.floor(Math.random() * 5);

      const enemyType = gameData.enemyTypes[enemyTypeIndex];
      const enemy: Enemy = {
        x: enemyPath.length > 0 ? enemyPath[0].x : 0,
        y: enemyPath.length > 0 ? enemyPath[0].y : 0,
        type: enemyType,
        health: enemyType.health * Math.pow(gameData.gameSettings.waveScaling, wave - 1),
        maxHealth: enemyType.health * Math.pow(gameData.gameSettings.waveScaling, wave - 1),
        speed: enemyType.speed,
        pathIndex: 0,
        progress: 0,
        slowEffect: 0
      };

      addEnemy(enemy);
      lastWaveSpawnRef.current = now;
      waveEnemiesSpawnedRef.current++;
    }
  }, [waveInProgress, wave, upgradeLevels, enemyPath, addEnemy]);

  const gameLoop = useCallback(() => {
    if (isPaused || gameOver) return;

    // Update towers
    towers.forEach(tower => updateTower(tower));

    // Update enemies
    const updatedEnemies = [...enemies];
    for (let i = updatedEnemies.length - 1; i >= 0; i--) {
      updateEnemy(updatedEnemies[i], i);
    }

    // Update projectiles
    const updatedProjectiles = [...projectiles];
    for (let i = updatedProjectiles.length - 1; i >= 0; i--) {
      updateProjectile(updatedProjectiles[i], i);
    }

    // Spawn enemies
    spawnEnemies();

    // Check wave completion
    if (waveInProgress && enemies.length === 0 && waveEnemiesSpawnedRef.current >= Math.min(5 + wave, 20)) {
      setWaveInProgress(false);
      nextWave();
      waveEnemiesSpawnedRef.current = 0;

      // Auto-start next wave if upgrade is purchased
      if (upgradeLevels["Auto-Start"] > 0) {
        setTimeout(() => {
          setWaveInProgress(true);
        }, 3000);
      }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [
    isPaused,
    gameOver,
    towers,
    enemies,
    projectiles,
    updateTower,
    updateEnemy,
    updateProjectile,
    spawnEnemies,
    waveInProgress,
    wave,
    setWaveInProgress,
    nextWave,
    upgradeLevels
  ]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  // Reset wave spawn counter when wave starts
  useEffect(() => {
    if (waveInProgress) {
      waveEnemiesSpawnedRef.current = 0;
    }
  }, [waveInProgress]);
};
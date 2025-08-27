import { useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import type { GameMap, PathPoint } from '../types';

export const useMapLoader = () => {
  const { setGameMap, setEnemyPath } = useGameStore();

  const generateEnemyPath = useCallback((gameMap: GameMap): PathPoint[] => {
    const { map, tileSize } = gameMap;
    const path: PathPoint[] = [];

    // Find start node (first row with a road in the first column)
    let startNode: { r: number; c: number } | null = null;
    for (let r = 0; r < map.length; r++) {
      if (map[r][0] === "road") {
        startNode = { r, c: 0 };
        break;
      }
    }

    if (!startNode) {
      console.error("No valid start node found in the first column.");
      return [];
    }

    // Find end node (last row with a road in the last column)
    let endNode: { r: number; c: number } | null = null;
    for (let r = map.length - 1; r >= 0; r--) {
      if (map[r][map[0].length - 1] === "road") {
        endNode = { r, c: map[0].length - 1 };
        break;
      }
    }

    if (!endNode) {
      console.error("No valid end node found in the last column.");
      return [];
    }

    // Breadth-First Search (BFS) to find the shortest path
    const queue = [startNode];
    const visited = new Set<string>();
    const parent = new Map<string, { r: number; c: number }>();

    visited.add(`${startNode.r},${startNode.c}`);

    const directions = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 }
    ];

    let foundPath = false;
    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.r === endNode.r && current.c === endNode.c) {
        foundPath = true;
        break;
      }

      for (const dir of directions) {
        const newRow = current.r + dir.dr;
        const newCol = current.c + dir.dc;

        if (
          newRow >= 0 &&
          newRow < map.length &&
          newCol >= 0 &&
          newCol < map[0].length &&
          map[newRow][newCol] === "road" &&
          !visited.has(`${newRow},${newCol}`)
        ) {
          queue.push({ r: newRow, c: newCol });
          visited.add(`${newRow},${newCol}`);
          parent.set(`${newRow},${newCol}`, current);
        }
      }
    }

    if (foundPath) {
      // Add spawn point outside the map
      const spawnPoint: PathPoint = {
        x: -tileSize / 2,
        y: startNode.r * tileSize + tileSize / 2
      };
      path.push(spawnPoint);

      // Reconstruct path from end to start
      let current: { r: number; c: number } | undefined = endNode;
      const pathPoints: PathPoint[] = [];
      while (current) {
        pathPoints.unshift({
          x: current.c * tileSize + tileSize / 2,
          y: current.r * tileSize + tileSize / 2
        });
        current = parent.get(`${current.r},${current.c}`);
      }
      path.push(...pathPoints);

      console.log("Generated enemy path with", path.length, "points");
    } else {
      console.error("No valid path found from start to end.");
    }

    return path;
  }, []);

  const loadMap = useCallback(async () => {
    try {
      const response = await fetch('/map.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const mapData: GameMap = await response.json();
      
      console.log('Map loaded:', mapData);
      setGameMap(mapData);
      
      const enemyPath = generateEnemyPath(mapData);
      setEnemyPath(enemyPath);
    } catch (error) {
      console.error('Could not load map:', error);
      
      // Fallback to embedded map data
      const fallbackMap: GameMap = {
        map: [
          ["free", "free", "free", "free", "free", "free", "free", "free", "free", "free"],
          ["free", "free", "free", "free", "free", "free", "free", "free", "free", "free"],
          ["road", "road", "road", "free", "road", "road", "road", "free", "road", "road"],
          ["free", "free", "road", "free", "road", "free", "road", "free", "road", "free"],
          ["free", "free", "road", "free", "road", "free", "road", "free", "road", "free"],
          ["free", "free", "road", "road", "road", "free", "road", "road", "road", "free"],
          ["free", "free", "free", "free", "free", "free", "free", "free", "free", "free"],
          ["free", "free", "free", "free", "free", "free", "free", "free", "free", "free"],
          ["free", "free", "free", "free", "free", "free", "free", "free", "free", "free"]
        ],
        tileSize: 64
      };
      
      console.log('Using fallback map data');
      setGameMap(fallbackMap);
      
      const enemyPath = generateEnemyPath(fallbackMap);
      setEnemyPath(enemyPath);
    }
  }, [setGameMap, setEnemyPath, generateEnemyPath]);

  useEffect(() => {
    loadMap();
  }, [loadMap]);
};
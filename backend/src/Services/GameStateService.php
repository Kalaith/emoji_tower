<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuthUser;
use RuntimeException;

final class GameStateService
{
    public function __construct(
        private readonly string $gameSlug,
        private readonly string $gameName
    ) {
    }

    public function initialState(): array
    {
        $data = $this->gameData();
        $settings = $data['gameSettings'];
        $now = $this->nowMs();

        return [
            'game_slug' => $this->gameSlug,
            'game_name' => $this->gameName,
            'schema_version' => 2,
            'gold' => (int) $settings['startingGold'],
            'xp' => 0,
            'lives' => (int) $settings['startingLives'],
            'wave' => 1,
            'gameSpeed' => 1,
            'isPaused' => false,
            'selectedTowerType' => null,
            'towers' => [],
            'enemies' => [],
            'projectiles' => [],
            'waveInProgress' => false,
            'gameOver' => false,
            'upgradeLevels' => $this->defaultUpgradeLevels(),
            'enemyPath' => $this->generateEnemyPath($this->gameMap()),
            'gameMap' => $this->gameMap(),
            'waveEnemiesSpawned' => 0,
            'lastWaveSpawnAt' => 0,
            'lastTickAt' => $now,
            'created_at' => gmdate('Y-m-d H:i:s'),
        ];
    }

    public function applyIntent(array $state, string $intent, array $payload): array
    {
        $state = $this->withDefaults($state);

        return match ($intent) {
            'select_tower_type' => $this->selectTowerType($state, $payload),
            'place_tower' => $this->placeTower($state, $payload),
            'start_wave' => $this->startWave($state),
            'pause_game' => $this->pauseGame($state),
            'toggle_speed' => $this->toggleSpeed($state),
            'reset_game' => $this->initialState(),
            'restart_game' => $this->restartGame($state),
            'buy_upgrade' => $this->buyUpgrade($state, $payload),
            'tick' => $this->tick($state),
            default => throw new RuntimeException('Unsupported game intent: ' . $intent),
        };
    }

    public function response(array $save, AuthUser $user): array
    {
        return [
            'user' => $user->toArray(),
            'save' => [
                'id' => $save['id'],
                'slot' => $save['save_slot'],
                'state' => $this->withDefaults($save['state']),
                'metadata' => $save['metadata'],
                'version' => $save['version'],
                'status' => $save['status'],
                'created_at' => $save['created_at'],
                'updated_at' => $save['updated_at'],
            ],
        ];
    }

    private function selectTowerType(array $state, array $payload): array
    {
        $towerName = $payload['towerName'] ?? null;
        if ($towerName === null) {
            $state['selectedTowerType'] = null;
            return $state;
        }

        if (!is_string($towerName)) {
            throw new RuntimeException('Tower name must be a string.');
        }

        $state['selectedTowerType'] = $this->towerType($towerName);
        return $state;
    }

    private function placeTower(array $state, array $payload): array
    {
        $x = $this->number($payload['x'] ?? null, 'x');
        $y = $this->number($payload['y'] ?? null, 'y');
        $selectedTower = $state['selectedTowerType'];
        if (!is_array($selectedTower)) {
            throw new RuntimeException('No tower type selected.');
        }

        if ((int) $state['gold'] < (int) $selectedTower['cost']) {
            throw new RuntimeException('Not enough gold.');
        }

        $gameMap = $state['gameMap'];
        $map = $gameMap['map'];
        $tileSize = (int) $gameMap['tileSize'];
        $gridX = (int) floor($x / $tileSize);
        $gridY = (int) floor($y / $tileSize);

        if ($gridY < 0 || $gridY >= count($map) || $gridX < 0 || $gridX >= count($map[0])) {
            throw new RuntimeException('Tower position is outside the map.');
        }

        if ($map[$gridY][$gridX] !== 'free') {
            throw new RuntimeException('Tower position is blocked.');
        }

        $towerX = $gridX * $tileSize + $tileSize / 2;
        $towerY = $gridY * $tileSize + $tileSize / 2;
        foreach ($state['towers'] as $tower) {
            if ((float) $tower['x'] === (float) $towerX && (float) $tower['y'] === (float) $towerY) {
                throw new RuntimeException('Tower position is already occupied.');
            }
        }

        $data = $this->gameData();
        $rangeMultiplier = 1 + ((int) $state['upgradeLevels']['Tower Range']) * (float) $data['upgrades'][1]['effect'];
        $damageMultiplier = 1 + ((int) $state['upgradeLevels']['Tower Damage']) * (float) $data['upgrades'][0]['effect'];
        $state['towers'][] = [
            'x' => $towerX,
            'y' => $towerY,
            'type' => $selectedTower,
            'lastShot' => 0,
            'range' => (float) $selectedTower['range'] * $rangeMultiplier,
            'damage' => (float) $selectedTower['damage'] * $damageMultiplier,
        ];
        $state['gold'] = (int) $state['gold'] - (int) $selectedTower['cost'];

        return $state;
    }

    private function startWave(array $state): array
    {
        if (!$state['waveInProgress'] && !$state['gameOver']) {
            $state['waveInProgress'] = true;
            $state['waveEnemiesSpawned'] = 0;
            $state['lastWaveSpawnAt'] = 0;
            $state['lastTickAt'] = $this->nowMs();
        }

        return $state;
    }

    private function pauseGame(array $state): array
    {
        $state['isPaused'] = !$state['isPaused'];
        return $state;
    }

    private function toggleSpeed(array $state): array
    {
        $speed = (int) $state['gameSpeed'];
        $state['gameSpeed'] = $speed === 1 ? 2 : ($speed === 2 ? 4 : 1);
        return $state;
    }

    private function restartGame(array $state): array
    {
        $next = $this->initialState();
        $data = $this->gameData();
        $next['upgradeLevels'] = $state['upgradeLevels'];
        $next['xp'] = (int) $state['xp'];
        $next['gold'] = (int) $data['gameSettings']['startingGold']
            + ((int) $state['upgradeLevels']['Starting Gold']) * (int) $data['upgrades'][2]['effect'];
        return $next;
    }

    private function buyUpgrade(array $state, array $payload): array
    {
        $upgradeName = $payload['upgradeName'] ?? null;
        if (!is_string($upgradeName)) {
            throw new RuntimeException('Upgrade name is required.');
        }

        $upgrade = $this->upgrade($upgradeName);
        $level = (int) ($state['upgradeLevels'][$upgradeName] ?? 0);
        $cost = (int) floor((int) $upgrade['baseCost'] * (1.5 ** $level));
        if ((int) $state['xp'] < $cost) {
            throw new RuntimeException('Not enough XP.');
        }

        $state['xp'] = (int) $state['xp'] - $cost;
        $state['upgradeLevels'][$upgradeName] = $level + 1;
        return $state;
    }

    private function tick(array $state): array
    {
        if ($state['isPaused'] || $state['gameOver']) {
            $state['lastTickAt'] = $this->nowMs();
            return $state;
        }

        $now = $this->nowMs();
        $state = $this->spawnEnemies($state, $now);
        $state = $this->updateTowers($state, $now);
        $state = $this->updateEnemies($state);
        $state['projectiles'] = [];
        $state['lastTickAt'] = $now;

        if ((int) $state['lives'] <= 0) {
            $state['lives'] = 0;
            $state['gameOver'] = true;
        }

        $enemiesInWave = min(5 + (int) $state['wave'], 20);
        if (
            $state['waveInProgress']
            && count($state['enemies']) === 0
            && (int) $state['waveEnemiesSpawned'] >= $enemiesInWave
        ) {
            $state['wave'] = (int) $state['wave'] + 1;
            $state['waveInProgress'] = (int) $state['upgradeLevels']['Auto-Start'] > 0;
            $state['waveEnemiesSpawned'] = 0;
            $state['lastWaveSpawnAt'] = $now;
        }

        return $state;
    }

    private function spawnEnemies(array $state, float $now): array
    {
        if (!$state['waveInProgress']) {
            return $state;
        }

        $data = $this->gameData();
        $spawnDelay = 1000 / (1 + ((int) $state['upgradeLevels']['Wave Delay']) * (float) $data['upgrades'][4]['effect']);
        $enemiesInWave = min(5 + (int) $state['wave'], 20);
        if ((int) $state['waveEnemiesSpawned'] >= $enemiesInWave) {
            return $state;
        }

        if ((float) $state['lastWaveSpawnAt'] !== 0.0 && $now - (float) $state['lastWaveSpawnAt'] < $spawnDelay) {
            return $state;
        }

        $wave = (int) $state['wave'];
        $maxIndex = 0;
        if ($wave > 3) {
            $maxIndex = 1;
        }
        if ($wave > 6) {
            $maxIndex = 2;
        }
        if ($wave > 10) {
            $maxIndex = 3;
        }
        if ($wave > 15) {
            $maxIndex = 4;
        }

        $enemyType = $data['enemyTypes'][random_int(0, $maxIndex)];
        $path = $state['enemyPath'];
        $health = (float) $enemyType['health'] * ((float) $data['gameSettings']['waveScaling'] ** ($wave - 1));
        $state['enemies'][] = [
            'x' => count($path) > 0 ? $path[0]['x'] : 0,
            'y' => count($path) > 0 ? $path[0]['y'] : 0,
            'type' => $enemyType,
            'health' => $health,
            'maxHealth' => $health,
            'speed' => (float) $enemyType['speed'],
            'pathIndex' => 0,
            'progress' => 0,
            'slowEffect' => 0,
        ];
        $state['lastWaveSpawnAt'] = $now;
        $state['waveEnemiesSpawned'] = (int) $state['waveEnemiesSpawned'] + 1;

        return $state;
    }

    private function updateTowers(array $state, float $now): array
    {
        foreach ($state['towers'] as $towerIndex => $tower) {
            if ($now - (float) $tower['lastShot'] < (float) $tower['type']['speed'] / (int) $state['gameSpeed']) {
                continue;
            }

            $targetIndex = $this->closestEnemyIndex($tower, $state['enemies']);
            if ($targetIndex === null) {
                continue;
            }

            $state['towers'][$towerIndex]['lastShot'] = $now;
            $state = $this->damageEnemy($state, $targetIndex, (float) $tower['damage'], (string) $tower['type']['name']);
        }

        return $this->collectDefeatedEnemies($state);
    }

    private function damageEnemy(array $state, int $targetIndex, float $damage, string $towerName): array
    {
        if (!isset($state['enemies'][$targetIndex])) {
            return $state;
        }

        $state['enemies'][$targetIndex]['health'] = (float) $state['enemies'][$targetIndex]['health'] - $damage;
        if ($towerName === 'Ice' && $state['enemies'][$targetIndex]['type']['name'] !== 'Robot') {
            $state['enemies'][$targetIndex]['slowEffect'] = max((float) $state['enemies'][$targetIndex]['slowEffect'], 0.5);
        }

        if ($towerName === 'Fire' || $towerName === 'Bomb') {
            $range = $towerName === 'Fire' ? 50 : 80;
            $target = $state['enemies'][$targetIndex];
            foreach ($state['enemies'] as $enemyIndex => $enemy) {
                if ($enemyIndex === $targetIndex) {
                    continue;
                }
                $distance = $this->distance((float) $enemy['x'], (float) $enemy['y'], (float) $target['x'], (float) $target['y']);
                if ($distance <= $range) {
                    $state['enemies'][$enemyIndex]['health'] = (float) $enemy['health'] - ($damage * 0.5);
                }
            }
        }

        return $state;
    }

    private function collectDefeatedEnemies(array $state): array
    {
        $survivors = [];
        $xpMultiplier = 1
            + ((int) $state['upgradeLevels']['XP Multiplier']) * (float) $this->gameData()['upgrades'][3]['effect'];

        foreach ($state['enemies'] as $enemy) {
            if ((float) $enemy['health'] <= 0) {
                $reward = (int) $enemy['type']['reward'];
                $state['gold'] = (int) $state['gold'] + $reward;
                $state['xp'] = (int) $state['xp'] + (int) floor($reward * 0.5 * $xpMultiplier);
                continue;
            }

            $survivors[] = $enemy;
        }

        $state['enemies'] = $survivors;
        return $state;
    }

    private function updateEnemies(array $state): array
    {
        $path = $state['enemyPath'];
        $survivors = [];

        foreach ($state['enemies'] as $enemy) {
            if (count($path) === 0) {
                continue;
            }

            $speed = (float) $enemy['speed'] * (1 - (float) $enemy['slowEffect']) * (int) $state['gameSpeed'];
            $enemy['progress'] = (float) $enemy['progress'] + $speed;
            if ((float) $enemy['slowEffect'] > 0) {
                $enemy['slowEffect'] = max(0, (float) $enemy['slowEffect'] - 0.02);
            }

            if ((int) $enemy['pathIndex'] < count($path) - 1) {
                $current = $path[(int) $enemy['pathIndex']];
                $next = $path[(int) $enemy['pathIndex'] + 1];
                $segmentLength = $this->distance((float) $current['x'], (float) $current['y'], (float) $next['x'], (float) $next['y']);
                if ($segmentLength > 0 && (float) $enemy['progress'] >= $segmentLength) {
                    $enemy['progress'] = (float) $enemy['progress'] - $segmentLength;
                    $enemy['pathIndex'] = (int) $enemy['pathIndex'] + 1;
                }

                if ((int) $enemy['pathIndex'] < count($path) - 1) {
                    $current = $path[(int) $enemy['pathIndex']];
                    $next = $path[(int) $enemy['pathIndex'] + 1];
                    $segmentLength = $this->distance((float) $current['x'], (float) $current['y'], (float) $next['x'], (float) $next['y']);
                    if ($segmentLength > 0) {
                        $t = min((float) $enemy['progress'] / $segmentLength, 1);
                        $enemy['x'] = (float) $current['x'] + ((float) $next['x'] - (float) $current['x']) * $t;
                        $enemy['y'] = (float) $current['y'] + ((float) $next['y'] - (float) $current['y']) * $t;
                    }
                }
                $survivors[] = $enemy;
                continue;
            }

            $last = $path[count($path) - 1];
            $enemy['x'] = (float) $last['x'] + (float) $enemy['progress'];
            if ((float) $enemy['x'] > (float) $this->gameData()['gameSettings']['canvasWidth'] + 50) {
                $state['lives'] = max(0, (int) $state['lives'] - 1);
                continue;
            }

            $survivors[] = $enemy;
        }

        $state['enemies'] = $survivors;
        return $state;
    }

    private function closestEnemyIndex(array $tower, array $enemies): ?int
    {
        $closestIndex = null;
        $closestDistance = (float) $tower['range'];
        foreach ($enemies as $index => $enemy) {
            $distance = $this->distance((float) $enemy['x'], (float) $enemy['y'], (float) $tower['x'], (float) $tower['y']);
            if ($distance <= (float) $tower['range'] && $distance < $closestDistance) {
                $closestDistance = $distance;
                $closestIndex = (int) $index;
            }
        }

        return $closestIndex;
    }

    private function withDefaults(array $state): array
    {
        $initial = $this->initialState();
        return array_merge($initial, $state);
    }

    private function defaultUpgradeLevels(): array
    {
        $levels = [];
        foreach ($this->gameData()['upgrades'] as $upgrade) {
            $levels[(string) $upgrade['name']] = 0;
        }

        return $levels;
    }

    private function towerType(string $name): array
    {
        foreach ($this->gameData()['towerTypes'] as $towerType) {
            if ($towerType['name'] === $name) {
                return $towerType;
            }
        }

        throw new RuntimeException('Tower type not found.');
    }

    private function upgrade(string $name): array
    {
        foreach ($this->gameData()['upgrades'] as $upgrade) {
            if ($upgrade['name'] === $name) {
                return $upgrade;
            }
        }

        throw new RuntimeException('Upgrade not found.');
    }

    private function gameData(): array
    {
        return $this->readJsonFile('game-data.json');
    }

    private function gameMap(): array
    {
        return $this->readJsonFile('map.json');
    }

    private function generateEnemyPath(array $gameMap): array
    {
        $map = $gameMap['map'];
        $tileSize = (int) $gameMap['tileSize'];
        $start = null;
        for ($row = 0; $row < count($map); $row++) {
            if ($map[$row][0] === 'road') {
                $start = ['r' => $row, 'c' => 0];
                break;
            }
        }

        $end = null;
        for ($row = count($map) - 1; $row >= 0; $row--) {
            if ($map[$row][count($map[0]) - 1] === 'road') {
                $end = ['r' => $row, 'c' => count($map[0]) - 1];
                break;
            }
        }

        if ($start === null || $end === null) {
            return [];
        }

        $queue = [$start];
        $visited = [$start['r'] . ',' . $start['c'] => true];
        $parent = [];
        $directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        $found = false;

        while ($queue !== []) {
            $current = array_shift($queue);
            if ($current['r'] === $end['r'] && $current['c'] === $end['c']) {
                $found = true;
                break;
            }

            foreach ($directions as [$dr, $dc]) {
                $nextRow = $current['r'] + $dr;
                $nextCol = $current['c'] + $dc;
                $key = $nextRow . ',' . $nextCol;
                if (
                    $nextRow >= 0
                    && $nextRow < count($map)
                    && $nextCol >= 0
                    && $nextCol < count($map[0])
                    && $map[$nextRow][$nextCol] === 'road'
                    && !isset($visited[$key])
                ) {
                    $queue[] = ['r' => $nextRow, 'c' => $nextCol];
                    $visited[$key] = true;
                    $parent[$key] = $current;
                }
            }
        }

        if (!$found) {
            return [];
        }

        $path = [[
            'x' => -$tileSize / 2,
            'y' => $start['r'] * $tileSize + $tileSize / 2,
        ]];
        $points = [];
        $current = $end;
        while ($current !== null) {
            array_unshift($points, [
                'x' => $current['c'] * $tileSize + $tileSize / 2,
                'y' => $current['r'] * $tileSize + $tileSize / 2,
            ]);
            $current = $parent[$current['r'] . ',' . $current['c']] ?? null;
        }

        return array_merge($path, $points);
    }

    private function readJsonFile(string $fileName): array
    {
        $path = __DIR__ . '/../../data/' . $fileName;
        if (!is_file($path)) {
            throw new RuntimeException('Missing backend data file: ' . $fileName);
        }

        $decoded = json_decode((string) file_get_contents($path), true);
        if (!is_array($decoded)) {
            throw new RuntimeException('Invalid backend data file: ' . $fileName);
        }

        return $decoded;
    }

    private function number(mixed $value, string $name): float
    {
        if (!is_int($value) && !is_float($value)) {
            throw new RuntimeException($name . ' must be numeric.');
        }

        return (float) $value;
    }

    private function distance(float $x1, float $y1, float $x2, float $y2): float
    {
        return sqrt(($x2 - $x1) ** 2 + ($y2 - $y1) ** 2);
    }

    private function nowMs(): float
    {
        return microtime(true) * 1000;
    }
}

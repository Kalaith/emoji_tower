# WebHatchery Game Apps - Master Design Standards

This document establishes the mandatory coding standards, architecture patterns, and best practices that ALL projects in this repository must follow.

## 🏗️ Architecture Requirements

### Mandatory Stack
- **Frontend**: React 18+ with TypeScript, Vite, Tailwind CSS
- **Backend**: PHP 8.1+ with Slim Framework, Eloquent ORM
- **State Management**: Zustand with persistence
- **Testing**: PHPUnit (backend), ESLint (frontend)
- **Code Style**: PSR-12 (PHP), ESLint + Prettier (TypeScript)

### Project Structure (MANDATORY)
```
<project_name>/
├── README.md                    # Must exist with setup instructions
├── publish.ps1                  # Deployment script following standard template  
├── frontend/
│   ├── package.json            # Must include all required scripts
│   ├── vite.config.ts          # Standard Vite configuration
│   ├── tailwind.config.js      # Tailwind configuration
│   ├── tsconfig.json           # TypeScript configuration
│   ├── eslint.config.js        # ESLint configuration
│   ├── src/
│   │   ├── App.tsx             # Main application component
│   │   ├── main.tsx            # Application entry point
│   │   ├── components/         # Component organization
│   │   │   ├── ui/             # Reusable UI components
│   │   │   ├── game/           # Game-specific components
│   │   │   └── layout/         # Layout components
│   │   ├── stores/             # Zustand stores
│   │   ├── types/              # TypeScript definitions
│   │   ├── hooks/              # Custom hooks
│   │   ├── api/                # API layer
│   │   ├── data/               # Static game data
│   │   ├── utils/              # Utility functions
│   │   └── styles/             # CSS and styling
│   └── dist/                   # Build output (gitignored)
└── backend/                    # Required for complex games
    ├── composer.json           # PHP dependencies and scripts
    ├── phpunit.xml             # Testing configuration
    ├── public/
    │   └── index.php           # Entry point
    ├── src/
    │   ├── Controllers/        # HTTP handlers (thin layer)
    │   ├── Actions/            # Business logic (Actions pattern)
    │   ├── Services/           # Complex business operations
    │   ├── Models/             # Eloquent models
    │   ├── External/           # Repository pattern
    │   ├── Routes/             # API routing
    │   ├── Middleware/         # HTTP middleware
    │   └── Utils/              # Helper utilities
    ├── tests/                  # Unit and integration tests
    ├── storage/                # Application storage
    └── vendor/                 # Composer dependencies (gitignored)
```

## 📋 Frontend Standards (React/TypeScript)

### Required Dependencies
```json
{
  "dependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0", 
    "typescript": "^5.0.0",
    "zustand": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^6.0.0",
    "eslint": "^9.0.0",
    "@types/react": "^18.0.0 || ^19.0.0",
    "@types/react-dom": "^18.0.0 || ^19.0.0"
  }
}
```

### Required Scripts in package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build", 
    "lint": "eslint .",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

### Component Standards
```typescript
// ✅ CORRECT: Functional component with proper typing
interface GameComponentProps {
  title: string;
  onAction: (action: string) => void;
  isActive?: boolean;
}

export const GameComponent: React.FC<GameComponentProps> = ({ 
  title, 
  onAction, 
  isActive = false 
}) => {
  const [localState, setLocalState] = useState<string>('');
  
  const handleClick = useCallback((action: string) => {
    onAction(action);
  }, [onAction]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">{title}</h2>
      {/* Component content */}
    </div>
  );
};

// ❌ WRONG: Class components, any types, inline styles
```

## 🧹 Clean Code Principles (React/TypeScript)

Clean code principles in React with TypeScript emphasize readability, maintainability, and scalability. These are MANDATORY standards for all components.

### 1. Meaningful Naming
```typescript
// ✅ CORRECT: Clear, descriptive names
interface UserProfileData {
  firstName: string;
  lastName: string;
  emailAddress: string;
}

const calculateUserExperiencePoints = (level: number): number => {
  return level * EXPERIENCE_MULTIPLIER;
};

const UserProfileCard: React.FC<UserProfileCardProps> = ({ userData }) => {
  // Implementation
};

// ❌ WRONG: Abbreviations, unclear names
interface UsrData {
  fn: string;
  ln: string;
  email: string;
}

const calc = (l: number): number => l * 100;
const UPC: React.FC = ({ data }) => { /* */ };
```

### 2. Single Responsibility Principle (SRP)
```typescript
// ✅ CORRECT: Each component has one responsibility
const UserAvatar: React.FC<{ imageUrl: string; size: 'sm' | 'md' | 'lg' }> = ({
  imageUrl,
  size
}) => (
  <img 
    src={imageUrl} 
    className={`rounded-full ${sizeClasses[size]}`}
    alt="User avatar"
  />
);

const UserName: React.FC<{ firstName: string; lastName: string }> = ({
  firstName,
  lastName
}) => (
  <span className="font-semibold">{firstName} {lastName}</span>
);

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user }) => (
  <div className="p-4 bg-white rounded-lg shadow">
    <UserAvatar imageUrl={user.avatar} size="md" />
    <UserName firstName={user.firstName} lastName={user.lastName} />
  </div>
);

// ❌ WRONG: Single component doing everything
const UserCard: React.FC = ({ user }) => {
  // Avatar rendering logic
  // Name formatting logic  
  // Status display logic
  // Action handlers
  // API calls
  // ... (100+ lines)
};
```

### 3. Leverage TypeScript's Type System
```typescript
// ✅ CORRECT: Explicit types, no any
interface GameState {
  level: number;
  experience: number;
  gold: number;
  inventory: Item[];
}

interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  stats: ItemStats;
}

type ItemType = 'weapon' | 'armor' | 'consumable' | 'misc';
type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

const calculateItemValue = (item: Item): number => {
  const baseValue = getBaseValue(item.type);
  const rarityMultiplier = getRarityMultiplier(item.rarity);
  return baseValue * rarityMultiplier;
};

// ❌ WRONG: Using any, loose typing
const calcValue = (item: any): any => {
  return item.base * item.mult;
};

interface BadProps {
  data: any;
  callback: any;
}
```

### 4. Component Structure and Organization
```typescript
// ✅ CORRECT: Small, focused components
// components/game/PlayerStats.tsx
interface PlayerStatsProps {
  level: number;
  experience: number;
  nextLevelExp: number;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({
  level,
  experience,
  nextLevelExp
}) => {
  const progressPercentage = (experience / nextLevelExp) * 100;

  return (
    <div className="player-stats">
      <div className="level">Level {level}</div>
      <div className="exp-bar">
        <div 
          className="exp-progress" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="exp-text">{experience} / {nextLevelExp} XP</div>
    </div>
  );
};

// components/game/PlayerInventory.tsx - Separate component
// components/game/PlayerActions.tsx - Separate component

// ❌ WRONG: One massive component
const PlayerPanel: React.FC = () => {
  // 200+ lines handling stats, inventory, actions, etc.
};
```

### 5. Functional Components and Hooks
```typescript
// ✅ CORRECT: Functional components with hooks
const GameTimer: React.FC<{ duration: number }> = ({ duration }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = useCallback(() => {
    setIsActive(!isActive);
  }, [isActive]);

  return (
    <div className="game-timer">
      <div className="time-display">{formatTime(timeLeft)}</div>
      <button onClick={toggleTimer} className="timer-button">
        {isActive ? 'Pause' : 'Start'}
      </button>
    </div>
  );
};

// ❌ WRONG: Class components (avoid unless absolutely necessary)
class GameTimerClass extends React.Component {
  // Class implementation
}
```

### 6. Avoid Magic Numbers and Strings
```typescript
// ✅ CORRECT: Named constants
const GAME_CONFIG = {
  MAX_LEVEL: 100,
  BASE_EXPERIENCE: 1000,
  LEVEL_MULTIPLIER: 1.5,
  GOLD_PER_LEVEL: 250,
} as const;

const ITEM_RARITY_COLORS = {
  common: '#9CA3AF',
  rare: '#3B82F6', 
  epic: '#8B5CF6',
  legendary: '#F59E0B',
} as const;

const calculateRequiredExperience = (level: number): number => {
  return GAME_CONFIG.BASE_EXPERIENCE * Math.pow(GAME_CONFIG.LEVEL_MULTIPLIER, level - 1);
};

const getRarityColor = (rarity: Rarity): string => {
  return ITEM_RARITY_COLORS[rarity];
};

// ❌ WRONG: Magic numbers and strings
const calcExp = (level: number): number => {
  return 1000 * Math.pow(1.5, level - 1); // What do these numbers mean?
};

const getColor = (rarity: string): string => {
  if (rarity === 'rare') return '#3B82F6'; // Hard-coded values
  // ...
};
```

### 7. Don't Repeat Yourself (DRY)
```typescript
// ✅ CORRECT: Reusable custom hook
const useGameTimer = (initialDuration: number) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const start = useCallback(() => setIsActive(true), []);
  const pause = useCallback(() => setIsActive(false), []);
  const reset = useCallback(() => {
    setTimeLeft(initialDuration);
    setIsActive(false);
  }, [initialDuration]);

  return {
    timeLeft,
    isActive,
    start,
    pause,
    reset,
    isFinished: timeLeft === 0
  };
};

// Usage in multiple components
const QuestTimer: React.FC = () => {
  const { timeLeft, start, pause, isActive } = useGameTimer(300);
  // Component implementation
};

const CombatTimer: React.FC = () => {
  const { timeLeft, start, reset, isFinished } = useGameTimer(60);
  // Component implementation
};

// ❌ WRONG: Duplicated timer logic in multiple components
```

### 8. Error Handling
```typescript
// ✅ CORRECT: Comprehensive error handling
interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

const useApiCall = <T>(apiFunction: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { data, error, loading, execute };
};

// Error boundary for components
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// ❌ WRONG: No error handling
const BadComponent: React.FC = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(setData); // What if this fails?
  }, []);

  return <div>{data.name}</div>; // What if data is null?
};
```

### 9. Performance Optimization
```typescript
// ✅ CORRECT: Memoization for expensive calculations
const ExpensiveGameCalculation: React.FC<{ gameData: GameData }> = ({ gameData }) => {
  const complexCalculation = useMemo(() => {
    // Expensive calculation that depends on gameData
    return processComplexGameLogic(gameData);
  }, [gameData]);

  return <div>{complexCalculation.result}</div>;
};

// Memoize components that receive stable props
const PlayerCard = React.memo<PlayerCardProps>(({ player, onAction }) => {
  return (
    <div className="player-card">
      <h3>{player.name}</h3>
      <div>Level: {player.level}</div>
      <button onClick={() => onAction(player.id)}>Action</button>
    </div>
  );
});

// Memoize callback functions
const GameBoard: React.FC<{ players: Player[] }> = ({ players }) => {
  const handlePlayerAction = useCallback((playerId: string) => {
    // Action logic
  }, []);

  return (
    <div>
      {players.map(player => (
        <PlayerCard 
          key={player.id}
          player={player}
          onAction={handlePlayerAction}
        />
      ))}
    </div>
  );
};

// ❌ WRONG: No optimization, unnecessary re-renders
const SlowComponent: React.FC = ({ data }) => {
  const expensiveResult = processComplexLogic(data); // Runs every render
  
  return (
    <div>
      {items.map(item => (
        <ItemCard 
          key={item.id}
          item={item}
          onAction={() => handleAction(item.id)} // New function every render
        />
      ))}
    </div>
  );
};
```

### 10. Testing Standards
```typescript
// ✅ CORRECT: Comprehensive testing
// PlayerStats.test.tsx
import { render, screen } from '@testing-library/react';
import { PlayerStats } from './PlayerStats';

describe('PlayerStats', () => {
  const mockProps = {
    level: 5,
    experience: 1200,
    nextLevelExp: 2000,
  };

  it('displays the correct level', () => {
    render(<PlayerStats {...mockProps} />);
    expect(screen.getByText('Level 5')).toBeInTheDocument();
  });

  it('calculates progress percentage correctly', () => {
    render(<PlayerStats {...mockProps} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle('width: 60%'); // 1200/2000 * 100
  });

  it('shows experience text', () => {
    render(<PlayerStats {...mockProps} />);
    expect(screen.getByText('1200 / 2000 XP')).toBeInTheDocument();
  });
});

// Custom hook testing
import { renderHook, act } from '@testing-library/react';
import { useGameTimer } from './useGameTimer';

describe('useGameTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts with correct initial duration', () => {
    const { result } = renderHook(() => useGameTimer(300));
    expect(result.current.timeLeft).toBe(300);
    expect(result.current.isActive).toBe(false);
  });

  it('decrements time when active', () => {
    const { result } = renderHook(() => useGameTimer(300));
    
    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.timeLeft).toBe(299);
  });
});
```

### State Management Standards (Zustand)
```typescript
// ✅ CORRECT: Typed Zustand store with persistence
interface GameState {
  gold: number;
  level: number;
  upgrades: Upgrade[];
}

interface GameActions {
  addGold: (amount: number) => void;
  purchaseUpgrade: (upgradeId: string) => void;
  resetGame: () => void;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // State
      gold: 0,
      level: 1,
      upgrades: [],
      
      // Actions
      addGold: (amount) => set(state => ({ 
        gold: state.gold + amount 
      })),
      
      purchaseUpgrade: (upgradeId) => set(state => ({
        upgrades: [...state.upgrades, findUpgrade(upgradeId)]
      })),
      
      resetGame: () => set({ gold: 0, level: 1, upgrades: [] })
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({ 
        gold: state.gold, 
        level: state.level, 
        upgrades: state.upgrades 
      })
    }
  )
);
```

### TypeScript Standards
```typescript
// ✅ CORRECT: Strict typing, no any types
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

type UserAction = 'create' | 'update' | 'delete';

// ✅ CORRECT: Generic types where appropriate
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// ❌ WRONG: any types, loose typing
const badFunction = (data: any): any => { /* ... */ };
```

### API Layer Standards
```typescript
// ✅ CORRECT: Typed API client
interface ApiClient {
  get<T>(url: string): Promise<ApiResponse<T>>;
  post<T, U>(url: string, data: U): Promise<ApiResponse<T>>;
}

class GameApiClient implements ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  async get<T>(url: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${url}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  }
}
```

### Required Configuration Files

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

**eslint.config.js:**
```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
```

## 🔧 Backend Standards (PHP)

### Required Dependencies (composer.json)
```json
{
  "require": {
    "php": "^8.1",
    "slim/slim": "^4.11",
    "slim/psr7": "^1.6", 
    "php-di/php-di": "^7.0",
    "illuminate/database": "^10.0",
    "vlucas/phpdotenv": "^5.5",
    "monolog/monolog": "^3.0",
    "respect/validation": "^2.2"
  },
  "require-dev": {
    "phpunit/phpunit": "^10.0",
    "squizlabs/php_codesniffer": "^3.7"
  },
  "scripts": {
    "start": "php -S localhost:8000 -t public/",
    "test": "phpunit",
    "cs-check": "phpcs --standard=PSR12 src/ tests/",
    "cs-fix": "phpcbf --standard=PSR12 src/ tests/"
  }
}
```

### Actions Pattern (MANDATORY)
```php
<?php
// ✅ CORRECT: Actions contain business logic
declare(strict_types=1);

namespace App\Actions;

use App\External\UserRepository;
use App\Models\User;

final class CreateUserAction
{
    public function __construct(
        private readonly UserRepository $userRepository
    ) {}

    public function execute(string $name, string $email): User
    {
        // Validation
        if (empty($name) || empty($email)) {
            throw new \InvalidArgumentException('Name and email are required');
        }

        // Business logic
        $user = new User();
        $user->name = $name;
        $user->email = $email;
        $user->created_at = new \DateTime();

        // Persistence
        return $this->userRepository->create($user);
    }
}
```

### Controller Standards (Thin Layer)
```php
<?php
// ✅ CORRECT: Controllers are thin HTTP handlers
declare(strict_types=1);

namespace App\Controllers;

use App\Actions\CreateUserAction;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final class UserController
{
    public function __construct(
        private readonly CreateUserAction $createUserAction
    ) {}

    public function create(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        try {
            $data = json_decode($request->getBody()->getContents(), true);
            
            $user = $this->createUserAction->execute($data['name'], $data['email']);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $user->toArray()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]));
            
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }
    }
}
```

### Model Standards (Eloquent)
```php
<?php
// ✅ CORRECT: Typed Eloquent models
declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class User extends Model
{
    protected $table = 'users';
    
    protected $fillable = [
        'name',
        'email',
        'level'
    ];

    protected $casts = [
        'level' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```

### Repository Pattern (MANDATORY)
```php
<?php
// ✅ CORRECT: Repository for data access
declare(strict_types=1);

namespace App\External;

use App\Models\User;

final class UserRepository
{
    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function create(User $user): User
    {
        $user->save();
        return $user;
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }
}
```

### Service Standards
```php
<?php
// ✅ CORRECT: Services for complex business logic
declare(strict_types=1);

namespace App\Services;

use App\External\UserRepository;
use App\Models\User;

final class UserService
{
    public function __construct(
        private readonly UserRepository $userRepository
    ) {}

    public function calculateUserLevel(User $user): int
    {
        // Complex business logic
        return min(floor($user->experience / 1000) + 1, 100);
    }

    public function promoteUser(User $user): User
    {
        $newLevel = $this->calculateUserLevel($user);
        $user->level = $newLevel;
        
        return $this->userRepository->update($user);
    }
}
```

## 📁 File Organization Standards

### Frontend File Naming
- **Components**: PascalCase (`GameBoard.tsx`, `UserProfile.tsx`)
- **Hooks**: camelCase starting with 'use' (`useGameLogic.ts`, `useAuth.ts`)
- **Stores**: camelCase ending with 'Store' (`gameStore.ts`, `uiStore.ts`)
- **Types**: camelCase (`game.ts`, `user.ts`)
- **Utils**: camelCase (`formatters.ts`, `calculations.ts`)

### Backend File Naming  
- **Classes**: PascalCase (`UserController.php`, `CreateUserAction.php`)
- **Interfaces**: PascalCase with Interface suffix (`UserRepositoryInterface.php`)
- **Traits**: PascalCase with Trait suffix (`ApiResponseTrait.php`)

## 🧪 Testing Standards

### Backend Testing (MANDATORY)
```php
<?php
// ✅ CORRECT: PHPUnit test with proper setup
declare(strict_types=1);

namespace Tests\Actions;

use App\Actions\CreateUserAction;
use App\External\UserRepository;
use PHPUnit\Framework\TestCase;

final class CreateUserActionTest extends TestCase
{
    private CreateUserAction $action;
    private UserRepository $userRepository;

    protected function setUp(): void
    {
        $this->userRepository = $this->createMock(UserRepository::class);
        $this->action = new CreateUserAction($this->userRepository);
    }

    public function testExecuteCreatesUser(): void
    {
        $this->userRepository
            ->expects($this->once())
            ->method('create')
            ->willReturn(new User());

        $result = $this->action->execute('John Doe', 'john@example.com');
        
        $this->assertInstanceOf(User::class, $result);
    }
}
```

## 🚀 Deployment Standards

### Required Scripts
Every project MUST include a `publish.ps1` PowerShell script following the standard template with:
- Environment-specific builds (preview/production)
- Dependency optimization
- Asset compilation
- Error handling and validation

### Environment Configuration
- **Frontend**: `.env.preview`, `.env.production` files
- **Backend**: `.env.<environment>` files with database and API configurations
- **Security**: Never commit actual `.env` files, only `.env.example`

## 📊 Code Quality Standards

### Metrics Requirements
- **TypeScript**: Strict mode enabled, no `any` types
- **PHP**: PSR-12 compliance, strict types declared
- **Test Coverage**: Minimum 70% for backend Actions and Services
- **Linting**: Zero ESLint errors, zero PHP_CodeSniffer errors

### Documentation Requirements
- **README.md**: Setup instructions, API documentation
- **Code Comments**: Complex business logic must be documented
- **Type Definitions**: All public APIs must be fully typed

## ❌ Prohibited Patterns

### Frontend Prohibitions

#### Architecture Violations
- ❌ Class components (use functional components only)
- ❌ Business logic in App.tsx (only routing and providers)
- ❌ Missing pages directory structure
- ❌ Massive components (>100 lines - break into smaller components)
- ❌ Direct DOM manipulation (use React paradigms)

#### Clean Code Violations
- ❌ `any` types in TypeScript (always use explicit types)
- ❌ Magic numbers and strings (use named constants)
- ❌ Abbreviated variable names (use descriptive names)
- ❌ Single-letter variables (except for obvious iterators)
- ❌ Functions with >5 parameters (use objects or break down)
- ❌ Nested ternary operators (use proper if/else or early returns)
- ❌ Deep nesting (>3 levels - extract functions/components)

#### Performance and Maintenance Violations
- ❌ Inline styles (use Tailwind classes or CSS modules)
- ❌ Global variables (use proper state management)
- ❌ Inline object/array creation in render (use useMemo/useCallback)
- ❌ Missing error boundaries for component trees
- ❌ No loading states for async operations
- ❌ Duplicated code without abstraction
- ❌ Missing TypeScript strict mode
- ❌ Unused imports or variables
- ❌ Console.log statements in production code

#### Testing and Documentation Violations
- ❌ Components without unit tests
- ❌ Complex logic without JSDoc comments
- ❌ Missing prop validation (TypeScript interfaces)
- ❌ No README or setup documentation

### Backend Prohibitions
- ❌ Business logic in Controllers
- ❌ Direct database queries in Controllers
- ❌ Missing type declarations (`declare(strict_types=1)`)
- ❌ SQL injection vulnerabilities (use Eloquent/prepared statements)
- ❌ Missing error handling

## 🔄 Migration Path

Projects not meeting these standards must be refactored to comply. Priority order:
1. **Critical**: Security vulnerabilities, type safety
2. **High**: Architecture patterns (Actions, proper separation)
3. **Medium**: File organization, naming conventions
4. **Low**: Code style, documentation improvements

This document serves as the single source of truth for all development in this repository. No exceptions without explicit architectural committee approval.
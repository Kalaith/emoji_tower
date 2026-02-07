# Emoji Tower Defense 🏰

A modern, emoji-themed tower defense game built with React, TypeScript, and cutting-edge web technologies. Defend your base against waves of adorable yet dangerous emoji enemies using strategically placed emoji towers!

## 🎮 Game Overview

Emoji Tower Defense is a classic tower defense game with a fun twist - everything is represented by emojis! Place towers like 🏹 Archer, 🔥 Fire, ❄️ Ice, ⚡ Lightning, and 💣 Bomb to defend against enemies such as 🐸 Frog, 🐕 Dog, 🐘 Elephant, 👻 Ghost, and 🤖 Robot.

### ✨ Key Features

- **5 Unique Tower Types**: Each with different damage, range, speed, and special effects
- **5 Enemy Types**: Diverse enemies with unique health, speed, and reward values
- **Upgrade System**: Enhance your towers and game mechanics with permanent upgrades
- **Wave-Based Gameplay**: Face increasingly difficult enemy waves
- **Real-time Strategy**: Position towers strategically on the game map
- **Resource Management**: Balance gold between tower purchases and upgrades
- **XP Progression**: Level up and unlock powerful upgrades
- **Responsive Design**: Play on desktop or mobile devices

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or a compatible package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd emoji_tower
   ```

2. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173` to start playing!

## 🎯 How to Play

### Basic Gameplay
1. **Place Towers**: Click on a tower type in the panel, then click on the map to place it
2. **Defend the Path**: Enemies will spawn and follow the path - stop them before they reach the end!
3. **Manage Resources**: Use your gold to buy towers and upgrades
4. **Survive Waves**: Each wave brings more enemies - strategic placement is key!

### Tower Types

| Tower | Emoji | Damage | Range | Speed | Cost | Special |
|-------|-------|--------|-------|-------|------|---------|
| **Archer** | 🏹 | 25 | 120 | 1000ms | 50 | Balanced stats |
| **Fire** | 🔥 | 40 | 80 | 1500ms | 100 | Area damage |
| **Ice** | ❄️ | 15 | 100 | 800ms | 75 | Slows enemies |
| **Lightning** | ⚡ | 100 | 150 | 2500ms | 200 | High damage, long range |
| **Bomb** | 💣 | 200 | 60 | 3000ms | 300 | Massive area damage |

### Enemy Types

| Enemy | Emoji | Health | Speed | Reward | Special |
|-------|-------|--------|-------|--------|---------|
| **Frog** | 🐸 | 50 | 1.0x | 10 | Basic enemy |
| **Dog** | 🐕 | 30 | 1.5x | 15 | Fast but fragile |
| **Elephant** | 🐘 | 150 | 0.5x | 25 | Slow tank |
| **Ghost** | 👻 | 80 | 1.2x | 20 | Can phase through attacks |
| **Robot** | 🤖 | 120 | 0.8x | 30 | Immune to ice effects |

### Upgrades

Invest your gold in permanent upgrades to enhance your gameplay:

- **⚔️ Tower Damage**: +10% damage to all towers
- **🎯 Tower Range**: +5% range to all towers
- **💰 Starting Gold**: +50 gold at the start of each run
- **⭐ XP Multiplier**: Earn 20% more XP
- **⏰ Wave Delay**: 10% delay between enemy spawns
- **🚀 Auto-Start**: Automatically start the next wave

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS for responsive design
- **State Management**: Zustand with persistence
- **Animations**: Framer Motion for smooth interactions
- **Charts**: Chart.js for game statistics
- **Routing**: React Router DOM for navigation
- **Utilities**: Custom hooks and utility functions

### Development Tools
- **Linting**: ESLint with React and TypeScript rules
- **Type Checking**: TypeScript strict mode
- **Code Formatting**: Prettier integration
- **Testing**: ESLint for code quality

## 📁 Project Structure

```
emoji_tower/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Reusable UI components
│   │   │   ├── GameCanvas.tsx    # Main game canvas
│   │   │   ├── GameControls.tsx  # Game control buttons
│   │   │   ├── GameHeader.tsx    # Game header with stats
│   │   │   ├── GameOverModal.tsx # Game over screen
│   │   │   └── TowerPanel.tsx    # Tower selection panel
│   │   ├── stores/
│   │   │   └── gameStore.ts      # Game state management
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript definitions
│   │   ├── hooks/
│   │   │   ├── useGameLoop.ts    # Game loop logic
│   │   │   └── useMapLoader.ts   # Map loading utilities
│   │   ├── data/
│   │   │   └── gameData.ts       # Game configuration
│   │   └── utils/
│   │       └── cn.ts             # Utility functions
│   ├── public/
│   │   └── map.json              # Game map data
│   └── package.json              # Dependencies and scripts
├── MASTER_DESIGN_STANDARDS.md    # Development standards
└── publish.ps1                   # Deployment script
```

## 🎨 Game Mechanics

### Combat System
- **Real-time Combat**: Towers automatically target and attack enemies within range
- **Projectile Physics**: Watch projectiles travel from towers to enemies
- **Area Effects**: Some towers (Fire, Bomb) damage multiple enemies
- **Special Effects**: Ice towers slow enemies, Fire towers burn over time

### Progression System
- **Wave Scaling**: Each wave increases enemy count and difficulty
- **XP Rewards**: Earn XP from defeated enemies to unlock upgrades
- **Gold Economy**: Balance spending on towers vs. saving for upgrades
- **Lives System**: Lose lives when enemies reach the end of the path

### Map System
- **Grid-based Placement**: Towers snap to a grid for strategic positioning
- **Pathfinding**: Enemies follow predefined paths through the map
- **Dynamic Map Loading**: Maps are loaded from JSON configuration

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

### Code Quality

This project follows strict development standards:

- **TypeScript Strict Mode**: No `any` types, full type safety
- **ESLint Configuration**: Comprehensive linting rules
- **Clean Architecture**: Separation of concerns with proper patterns
- **Performance Optimization**: Memoization and efficient rendering
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Architecture Patterns

- **Component Composition**: Small, reusable React components
- **Custom Hooks**: Encapsulated logic for game mechanics
- **State Management**: Centralized game state with Zustand
- **Type Safety**: Comprehensive TypeScript interfaces
- **Error Boundaries**: Graceful error handling

## 🤝 Contributing

We welcome contributions! Please follow our development standards:

1. Follow the [MASTER_DESIGN_STANDARDS.md](MASTER_DESIGN_STANDARDS.md)
2. Use TypeScript for all new code
3. Write meaningful commit messages
4. Test your changes thoroughly
5. Run the linter before submitting

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following our standards
4. **Run the linter**: `npm run lint`
5. **Test your changes** thoroughly
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

## License

This project is licensed under the MIT License - see the individual component README files for details.

**Happy Defending! 🛡️**

Part of the WebHatchery game collection.</content>

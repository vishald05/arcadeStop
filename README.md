# ArcadeStop 🕹️

> **"Your stop for one more game."**

ArcadeStop is a mini browser gaming platform designed with a modern indie arcade aesthetic. It is crafted for quick breathers, endless retries, and instant zero-setup gaming.

---

## 🚀 Phase 1: The Arcade Foundation

This repository contains the complete **Phase 1: Foundation & Homepage** implementation:
- **Design System**: A dark indie arcade palette (`#101014`, `#181820`, `#20202B`, `#A78BFA`, `#60A5FA`, `#F472B6`), subtle scanline/dot textures, crisp typography, and individual game card visual identities.
- **Hero Experience**: Arcade marquee screen mockup with dynamic lighting and instant "Explore Games" / "Surprise Me" actions.
- **Centralized Game Catalog**: Complete data-driven catalog with 6 launch titles:
  1. **Reaction Rush** (Reflex — *First Planned Game, Available Soon*)
  2. **Memory Madness** (Brain — *Coming Soon*)
  3. **Number Ninja** (Puzzle — *Coming Soon*)
  4. **TypeStorm** (Skills — *Coming Soon*)
  5. **Sequence Master** (Memory — *Coming Soon*)
  6. **Whack Attack** (Reflex — *Coming Soon*)
- **Interactive Feedback**: Notification toast system informing users of launch roadmaps when interacting with upcoming titles.
- **Core Information Section**: "Zero setup. Maximum fun." highlighting privacy, no-account play, and instant browser performance.
- **Navigation & Routing**:
  - `/` — Homepage
  - `/arcade` — Full Arcade Collection with category filtering
  - `/records` — Polished placeholder empty state for future local high scores & records

---

## 🛠️ Tech Stack

- **React 18** (JavaScript)
- **Vite 6**
- **React Router DOM 6**
- **Lucide React** (Indie icons)
- **Plain CSS** with CSS Custom Properties (zero CSS frameworks)

---

## 📦 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production
```bash
npm run build
```
The optimized bundle will be generated in `dist/`.

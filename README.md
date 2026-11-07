# ArcadeStop 🕹️

> **"Your stop for one more game."**

ArcadeStop is a mini browser gaming platform designed with a modern indie arcade aesthetic, built for quick breathers, endless retries, and instant zero-setup gaming.

---

## ⚡ Phase 2: Reaction Rush

Reaction Rush is ArcadeStop's reflex challenge. Test your reflexes against a high-resolution browser timer across 5 attempts per session, with anonymous personal record tracking powered by Spring Boot and PostgreSQL.

### How to Play Reaction Rush

1. **Access the Game**: Navigate to [Arcade](/arcade) or click **Play Now** on the **Reaction Rush** card from the homepage.
2. **Start a Session**: Click **Start Session** (or press Space / Enter) to begin attempt 1 of 5.
3. **Wait for Green**:
   - `COUNTDOWN` & `READY` states: The game initiates a random delay between 2,000 ms and 5,000 ms.
   - Screen clearly signals: **"Waiting for signal... Don't click yet!"**
4. **Beware of False Starts**:
   - Clicking or pressing Space/Enter before the green signal triggers a **False Start**.
   - False starts are clearly reported and **do not count** towards the 5 successful attempts. Click **Try Again** to retry that attempt.
5. **React to the Green Signal**:
   - When the signal turns **clear green** with **"GO!"**, click the game area or press Space/Enter as fast as you can.
   - Reaction time is measured accurately using the browser's high-resolution `performance.now()` timer.
6. **Review Attempt & Continue**:
   - After each attempt, your reaction time in milliseconds is displayed. Click **Next Attempt** to proceed.
7. **Session Results & Personal Best**:
   - After completing all 5 attempts, the session summary displays:
     - All 5 attempt times
     - Session average reaction time (rounded)
     - Session best reaction time
     - All-time personal best from previous sessions
     - New Personal Best badge (if achieved)
   - Options to **Play Again** or **Return to Arcade**.

### Controls
- **Mouse / Touch**: Click anywhere inside the game arena.
- **Keyboard**: <kbd>Space</kbd> or <kbd>Enter</kbd>.
- Page scrolling is prevented when <kbd>Space</kbd> is used as game input.
- Keyboard shortcuts are ignored when interacting with input, textarea, or select controls.

---

## 🥷 Phase 3: Number Ninja

Number Ninja is ArcadeStop's second fully playable game. Use mathematical deduction to uncover a secret integer between 1 and 100 within 7 attempts, guided by dynamic range narrowing and personal statistics tracking.

### How to Play Number Ninja

1. **Access the Game**: Click **Play Now** on the **Number Ninja** card on the homepage or in the [Arcade](/arcade) collection.
2. **Start Game**: Click **Start Game** to initiate a new session with a secretly chosen random integer (1–100).
3. **Make Guesses**:
   - Enter your guess in the prominent numeric input and click **Guess** (or press <kbd>Enter</kbd>).
   - Valid inputs must be integers between 1 and 100.
   - Invalid, decimal, empty, or duplicate guesses show a clear feedback banner **without consuming attempts**.
4. **Dynamic Range Visualisation**:
   - After each guess, the game visually narrows down the candidate pool on an active range track:
     - "Too low!" shifts the minimum bound higher.
     - "Too high!" shifts the maximum bound lower.
   - A live candidate count displays the exact remaining possibilities.
5. **Win & Loss Screens**:
   - **Win**: Guessing the secret number within 7 attempts wins the round. Displays the secret number, guesses used, remaining attempts, and personal record status.
   - **Loss**: Exhausting all 7 attempts triggers game over and reveals the secret number.
   - Both screens provide **Play Again** and **Return to Arcade** actions.

### Anonymous Statistics Tracked
- **Total Games Played & Won**
- **Win Percentage** (e.g. 75.0%)
- **Average Guesses per Win**
- **Best Score** (fewest guesses in a win)
- **Current Win Streak & All-Time Best Win Streak**

---

## 🆔 Anonymous Browser Records

ArcadeStop requires **zero authentication or user accounts**:
- On first visit, a unique UUID v4 is generated client-side and saved in `localStorage` under `arcadestop_reaction_rush_browser_id`.
- This browser identifier is shared across all ArcadeStop mini-games to associate personal bests, session counts, and streak histories.
- **Privacy-first**: No names, email addresses, IP addresses, or personal info are stored.
- Gracefully handles disabled or corrupted `localStorage` by falling back to session-scoped UUIDs without interrupting gameplay.

---

## 🏗️ Monorepo Project Structure

```
ArcadeStop/
├── frontend/                     # React + Vite Client
│   ├── src/
│   │   ├── components/           # UI Components (Navbar, Hero, GameCard, GameGrid, Footer, etc.)
│   │   ├── games/
│   │   │   ├── ReactionRush/     # Reaction Rush Game (ReactionRushGame.jsx, ReactionRushGame.css, constants.js)
│   │   │   └── NumberNinja/      # Number Ninja Game (NumberNinjaGame.jsx, NumberNinjaGame.css, constants.js)
│   │   ├── pages/                # Pages (Home, Arcade, GamePage, Records)
│   │   ├── services/             # API Clients (api.js, gameService.js, reactionRushService.js, numberNinjaService.js)
│   │   ├── utils/                # Utility modules (browserId.js)
│   │   ├── hooks/                # Custom React Hooks (useGames.js)
│   │   ├── styles/               # Global & Component CSS
│   │   ├── App.jsx               # Root Route & Toast Manager
│   │   └── main.jsx              # Vite Entrypoint
│   ├── tests/                    # Node test runner suite (reactionRush.test.js, numberNinja.test.js)
│   ├── public/                   # Static Assets (favicon.svg)
│   ├── .env.example              # Frontend environment template
│   ├── package.json              # Frontend dependencies and test script
│   └── vite.config.js            # Vite configuration
│
├── backend/                      # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/arcadestop/
│   │   │   │   ├── controller/   # REST Controllers (GameController, ReactionRushController, NumberNinjaController, HealthController)
│   │   │   │   ├── service/      # Business Logic (GameService, ReactionRushService, NumberNinjaService)
│   │   │   │   ├── repository/   # Spring Data JPA (GameRepository, ReactionRushRecordRepository, NumberNinjaRecordRepository)
│   │   │   │   ├── entity/       # JPA Entities (Game, GameStatus, ReactionRushRecord, NumberNinjaRecord)
│   │   │   │   ├── dto/          # DTOs (Request/Response DTOs for catalogue, Reaction Rush, and Number Ninja)
│   │   │   │   ├── config/       # Startup Data Seed & Sync (DataInitializer, CorsConfig)
│   │   │   │   ├── exception/    # Error Handling (GlobalExceptionHandler, ResourceNotFoundException)
│   │   │   │   └── ArcadeStopApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties         # PostgreSQL Production/Default config
│   │   │       └── application-local.properties   # Local standalone fallback config
│   │   └── test/
│   │       ├── java/com/arcadestop/               # Automated Tests (Controller, Service, Context, Config)
│   │       └── resources/
│   │           └── application-test.properties    # Isolated Test Profile (H2 PostgreSQL Mode)
│   ├── .env.example              # Backend environment template
│   └── pom.xml                   # Maven dependencies and build definition
│
└── README.md                     # Project documentation
```

---

## 🛠️ Technology Stack

### Backend
- **Java 21 LTS**
- **Spring Boot 3.4.2**
  - Spring Web (`spring-boot-starter-web`)
  - Spring Data JPA (`spring-boot-starter-data-jpa`)
  - Bean Validation (`spring-boot-starter-validation`)
  - PostgreSQL Driver (`org.postgresql:postgresql`)
  - H2 Database (`com.h2database:h2` for isolated automated test suite)
  - Spring Boot Test & MockMvc

### Frontend
- **React 18**
- **Vite 6**
- **React Router DOM 7**
- **Lucide React** (Indie arcade iconography)
- **Plain CSS** (Custom properties design system, `#101014`, `#181820`, `#20202B`, `#A78BFA`, `#60A5FA`, `#34D399`, `#F472B6`, `#F5F3FF`, `#A1A1B5`)

### Database
- **PostgreSQL** (`arcadestop`)

---

## 🔌 API Endpoints

All endpoints are hosted under `/api` with CORS enabled for `http://localhost:5173`.

### Game Catalog Endpoints
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/health` | Application & service health status | `200 OK` |
| `GET` | `/api/games` | Retrieve all games in the catalog | `200 OK` |
| `GET` | `/api/games/{slug}` | Retrieve single game details by unique slug | `200 OK`, `404 Not Found` |
| `GET` | `/api/games/category/{category}` | Filter games by category | `200 OK` |

### Reaction Rush Endpoints
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/reaction-rush/records/{browserId}` | Retrieve previous personal record for browser ID | `200 OK`, `404 Not Found` |
| `POST` | `/api/reaction-rush/records/{browserId}` | Submit 5 reaction times from completed session | `200 OK`, `400 Bad Request` |

### Number Ninja Endpoints
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/number-ninja/records/{browserId}` | Retrieve previous personal stats for browser ID | `200 OK`, `404 Not Found` |
| `POST` | `/api/number-ninja/records/{browserId}` | Submit a completed session (idempotent via sessionId) | `200 OK`, `400 Bad Request` |

#### Number Ninja POST Request Body:
```json
{
  "sessionId": "nn-987e6543-e21b-12d3-a456-426614174000",
  "won": true,
  "guessesUsed": 4
}
```

#### Number Ninja POST / GET Response DTO:
```json
{
  "id": 1,
  "browserId": "123e4567-e89b-12d3-a456-426614174000",
  "totalGamesPlayed": 5,
  "totalGamesWon": 4,
  "totalGuessesInWins": 16,
  "bestGuesses": 3,
  "currentWinStreak": 2,
  "bestWinStreak": 3,
  "winPercentage": 80.0,
  "averageGuessesPerWin": 4.0,
  "updatedAt": "2026-11-08T00:20:00",
  "newPersonalBest": true
}
```

#### Backend Validation & Idempotency Rules:
- `guessesUsed` must be between 1 and 7.
- A winning session must have between 1 and 7 guesses.
- A lost session must have exactly 7 guesses.
- All statistics (percentages, averages, streaks, best score) are computed strictly on the backend.
- Duplicate submissions with the same `sessionId` return the current record idempotently without incrementing totals.

---

## 🗄️ Database Changes

Hibernate `update` mode (`spring.jpa.hibernate.ddl-auto=update`) automatically creates the tables:

### 1. Reaction Rush Records Table:
```sql
CREATE TABLE reaction_rush_records (
    id BIGSERIAL PRIMARY KEY,
    browser_id VARCHAR(36) NOT NULL,
    best_reaction_ms INTEGER NOT NULL,
    average_reaction_ms INTEGER NOT NULL,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_reaction_rush_browser_id UNIQUE (browser_id)
);
```

### 2. Number Ninja Records Table:
```sql
CREATE TABLE number_ninja_records (
    id BIGSERIAL PRIMARY KEY,
    browser_id VARCHAR(36) NOT NULL,
    total_games_played INTEGER NOT NULL DEFAULT 0,
    total_games_won INTEGER NOT NULL DEFAULT 0,
    total_guesses_in_wins INTEGER NOT NULL DEFAULT 0,
    best_guesses INTEGER,
    current_win_streak INTEGER NOT NULL DEFAULT 0,
    best_win_streak INTEGER NOT NULL DEFAULT 0,
    last_session_id VARCHAR(64),
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_number_ninja_browser_id UNIQUE (browser_id)
);
```

### 3. Idempotent Data Initializer:
`DataInitializer` synchronizes catalogue records on startup:
- Fresh databases seed both **Reaction Rush** and **Number Ninja** as `AVAILABLE`.
- Existing databases update **Number Ninja** to `AVAILABLE` without altering other fields or resetting custom data.
- The remaining 4 games (**Memory Madness**, **TypeStorm**, **Sequence Master**, **Whack Attack**) remain `COMING_SOON`.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`):
```env
DB_URL=jdbc:postgresql://localhost:5432/arcadestop
DB_USERNAME=postgres
DB_PASSWORD=postgres
CORS_ALLOWED_ORIGINS=http://localhost:5173
PORT=8080
```

### Frontend (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 🚀 Startup Instructions

### 1. Run the Backend
```bash
cd backend
./mvnw spring-boot:run
```
To run with local H2 in-memory fallback without PostgreSQL:
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```
API server runs on [http://localhost:8080](http://localhost:8080).

### 2. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Client runs on [http://localhost:5173](http://localhost:5173).

---

## 🧪 Testing Results

### Backend Tests
Run the Maven test suite:
```bash
cd backend
./mvnw test
```
**Results:**
- **46 / 46 tests passed (0 failures, 0 errors, 0 skipped)**
- Tests include:
  - `ArcadeStopApplicationTests` (1 test)
  - `DataInitializerTest` (2 tests: fresh DB seeding & existing record status sync)
  - `GameServiceTest` (4 tests)
  - `GameControllerTest` (5 tests)
  - `DotenvEnvironmentPostProcessorTest` (3 tests)
  - `ReactionRushServiceTest` (9 tests)
  - `ReactionRushControllerTest` (7 tests)
  - `NumberNinjaServiceTest` (9 tests)
  - `NumberNinjaControllerTest` (6 tests)

### Frontend Tests
Run the Node native test suite:
```bash
cd frontend
npm test
```
**Results:**
- **21 / 21 tests passed across 6 test suites (0 failures, 0 errors, 0 skipped)**
- Tests cover:
  - Anonymous browser identity generation, persistence, and corruption fallback.
  - API client error handling and DTO serialization for both games.
  - Reaction Rush 7-state machine, false start timing, and duplicate protection.
  - Number Ninja RNG distribution, invalid input rejection without attempt penalty, range narrowing logic, winning deduction, loss on 7 attempts, and idempotency.

### Production Build
```bash
cd frontend
npm run build
```
Builds cleanly with zero errors in ~2.1s.

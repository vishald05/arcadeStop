# ArcadeStop 🕹️

> **"Your stop for one more game."**

Live Link : Coming Soon

ArcadeStop is a mini browser gaming platform designed with a modern indie arcade aesthetic, built for quick breathers, endless retries, and instant zero-setup gaming.

---

## ⚡ Phase 2: Reaction Rush

Reaction Rush is ArcadeStop's first fully playable mini-game. Test your reflexes against a high-resolution browser timer across 5 attempts per session, with anonymous personal record tracking powered by Spring Boot and PostgreSQL.

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

## 🆔 Anonymous Browser Records

ArcadeStop requires **zero authentication or user accounts**:
- On first visit to Reaction Rush, a unique UUID v4 is generated client-side and saved in `localStorage` under `arcadestop_reaction_rush_browser_id`.
- On return visits, this identifier is reused to associate and retrieve the browser's personal best and session count.
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
│   │   │   └── ReactionRush/     # Reaction Rush Game (ReactionRushGame.jsx, ReactionRushGame.css, constants.js)
│   │   ├── pages/                # Pages (Home, Arcade, GamePage, Records)
│   │   ├── services/             # API Clients (api.js, gameService.js, reactionRushService.js)
│   │   ├── utils/                # Utility modules (browserId.js)
│   │   ├── hooks/                # Custom React Hooks (useGames.js)
│   │   ├── styles/               # Global & Component CSS
│   │   ├── App.jsx               # Root Route & Toast Manager
│   │   └── main.jsx              # Vite Entrypoint
│   ├── tests/                    # Node test runner suite (reactionRush.test.js)
│   ├── public/                   # Static Assets (favicon.svg)
│   ├── .env.example              # Frontend environment template
│   ├── package.json              # Frontend dependencies and test script
│   └── vite.config.js            # Vite configuration
│
├── backend/                      # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/arcadestop/
│   │   │   │   ├── controller/   # REST Controllers (GameController, HealthController, ReactionRushController)
│   │   │   │   ├── service/      # Business Logic (GameService, ReactionRushService)
│   │   │   │   ├── repository/   # Spring Data JPA (GameRepository, ReactionRushRecordRepository)
│   │   │   │   ├── entity/       # JPA Entities (Game, GameStatus, ReactionRushRecord)
│   │   │   │   ├── dto/          # DTOs (ReactionRushRecordDto, ReactionRushSessionRequestDto, etc.)
│   │   │   │   ├── config/       # CORS & Startup Data Seed (CorsConfig, DataInitializer)
│   │   │   │   ├── exception/    # Error Handling (GlobalExceptionHandler, ResourceNotFoundException)
│   │   │   │   └── ArcadeStopApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties         # PostgreSQL Production/Default config
│   │   │       └── application-local.properties   # Local standalone fallback config
│   │   └── test/
│   │       ├── java/com/arcadestop/               # Automated Tests (Controller, Service, Context)
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
- **Plain CSS** (Custom properties design system, `#101014`, `#181820`, `#20202B`, `#A78BFA`, `#60A5FA`, `#F5F3FF`, `#A1A1B5`)

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

#### POST Request Body:
```json
{
  "reactionTimes": [220, 245, 198, 230, 215]
}
```

#### POST / GET Response DTO:
```json
{
  "id": 1,
  "browserId": "123e4567-e89b-12d3-a456-426614174000",
  "bestReactionMs": 198,
  "averageReactionMs": 222,
  "totalSessions": 1,
  "updatedAt": "2026-11-07T20:50:00",
  "newPersonalBest": true
}
```

#### Backend Validation Rules:
- Exactly 5 reaction times required.
- Each value must be an integer between 1 and 5,000 ms.
- Best reaction time and rolling average are calculated server-side; client calculations are not trusted.
- `totalSessions` is incremented only after valid session acceptance.
- Safe against concurrent requests via database unique constraints on `browser_id`.

---

## 🗄️ Database Changes (Phase 2)

Hibernate `update` mode (`spring.jpa.hibernate.ddl-auto=update`) automatically creates the `reaction_rush_records` table:

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
- **29 / 29 tests passed (0 failures, 0 errors, 0 skipped)**
- Includes `ArcadeStopApplicationTests`, `GameServiceTest`, `GameControllerTest`, `ReactionRushServiceTest`, `ReactionRushControllerTest`.

### Frontend Tests
Run the Node native test suite:
```bash
cd frontend
npm test
```
**Results:**
- **11 / 11 tests passed (0 failures, 0 errors, 0 skipped)**
- Tests cover UUID v4 generation, localStorage persistence & error fallback, API service (GET 404 handling, POST payload verification, 500 error propagation), 7 game state transitions, false start handling, 5-attempt session completion, duplicate-click protection, and timer cleanup.

### Production Build
```bash
cd frontend
npm run build
```
Builds cleanly with zero errors.

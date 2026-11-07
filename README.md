# ArcadeStop 🕹️

> **"Your stop for one more game."**

Live Link : Coming Soon

ArcadeStop is a mini browser gaming platform designed with a modern indie arcade aesthetic, built for quick breathers, endless retries, and instant zero-setup gaming.

---

## 🏗️ Monorepo Project Structure

```
ArcadeStop/
├── frontend/                     # React + Vite Client
│   ├── src/
│   │   ├── components/           # UI Components (Navbar, Hero, GameCard, GameGrid, InfoSection, Footer, NotificationToast)
│   │   ├── pages/                # Page Views (Home, Arcade, Records)
│   │   ├── services/             # API Client & Game Service (api.js, gameService.js)
│   │   ├── hooks/                # Custom React Hooks (useGames.js)
│   │   ├── styles/               # Global & Component CSS
│   │   ├── App.jsx               # Root Route & Toast Manager
│   │   └── main.jsx              # Vite Entrypoint
│   ├── public/                   # Static Assets (favicon.svg)
│   ├── .env.example              # Frontend environment template
│   ├── package.json              # Frontend dependencies and scripts
│   └── vite.config.js            # Vite configuration
│
├── backend/                      # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/arcadestop/
│   │   │   │   ├── controller/   # REST Controllers (GameController, HealthController)
│   │   │   │   ├── service/      # Business Logic (GameService)
│   │   │   │   ├── repository/   # Spring Data JPA (GameRepository)
│   │   │   │   ├── entity/       # JPA Entities & Enums (Game, GameStatus)
│   │   │   │   ├── dto/          # Response DTOs (GameResponseDto)
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
  - H2 Database (`com.h2database:h2` for test and local fallback profile)
  - Spring Boot Test & MockMvc

### Frontend
- **React 18**
- **Vite 6**
- **React Router DOM 6**
- **Lucide React** (Indie gaming icons)
- **Plain CSS** (Custom properties design system, zero Tailwind)

### Database
- **PostgreSQL** (`arcadestop`)

---

## 🔌 Backend API Endpoints

All endpoints are hosted under `/api` with configured CORS for `http://localhost:5173`.

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/health` | Application & service health status | `200 OK` |
| `GET` | `/api/games` | Retrieve all games in the catalog | `200 OK` |
| `GET` | `/api/games/{slug}` | Retrieve single game details by unique slug | `200 OK`, `404 Not Found` |
| `GET` | `/api/games/category/{category}` | Filter games by category (case-insensitive) | `200 OK` |

### Sample Response (`GET /api/games/reaction-rush`):
```json
{
  "id": 1,
  "name": "Reaction Rush",
  "slug": "reaction-rush",
  "description": "Test your reflexes. Wait for the signal and click as fast as you can.",
  "category": "Reflex",
  "icon": "zap",
  "status": "COMING_SOON",
  "featured": true,
  "createdAt": "2026-11-03T22:57:24.774298"
}
```

---

## 🗄️ Database Setup (PostgreSQL)

### 1. Create PostgreSQL Database and User
Connect to your PostgreSQL server via `psql`:
```sql
CREATE DATABASE arcadestop;
CREATE USER postgres WITH ENCRYPTED PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE arcadestop TO postgres;
```

### 2. Schema Management
Hibernate is configured to `update` mode (`spring.jpa.hibernate.ddl-auto=update`), so tables (`games`) and unique constraints (`uk_game_slug`) are generated automatically on startup without destructive schema changes.

### 3. Automatic Seed Data
The backend includes an idempotent `DataInitializer` that populates the 6 launch titles on startup only if they do not already exist:
1. **Reaction Rush** (Category: `Reflex`, Icon: `zap`, Featured: `true`, Status: `COMING_SOON`)
2. **Memory Madness** (Category: `Brain`, Icon: `brain`, Featured: `false`, Status: `COMING_SOON`)
3. **Number Ninja** (Category: `Puzzle`, Icon: `hash`, Featured: `false`, Status: `COMING_SOON`)
4. **TypeStorm** (Category: `Skills`, Icon: `keyboard`, Featured: `false`, Status: `COMING_SOON`)
5. **Sequence Master** (Category: `Memory`, Icon: `palette`, Featured: `false`, Status: `COMING_SOON`)
6. **Whack Attack** (Category: `Reflex`, Icon: `target`, Featured: `false`, Status: `COMING_SOON`)

---

## ⚙️ Environment Variables

### Backend (`backend/.env`):
Create `backend/.env` (or set system environment variables) modeled on `backend/.env.example`:
```env
DB_URL=jdbc:postgresql://localhost:5432/arcadestop
DB_USERNAME=postgres
DB_PASSWORD=postgres
CORS_ALLOWED_ORIGINS=http://localhost:5173
PORT=8080
```

### Frontend (`frontend/.env`):
Create `frontend/.env` modeled on `frontend/.env.example`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 🚀 Running the Project

### 1. Run the Backend
Ensure Java 21 and Maven are installed.

**With PostgreSQL running:**
```bash
cd backend
mvn spring-boot:run
```

**Without a local PostgreSQL service running (using local profile):**
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```
The API server starts on [http://localhost:8080](http://localhost:8080).

### 2. Run the Frontend
In another terminal:
```bash
cd frontend
npm install
npm run dev
```
The client starts on [http://localhost:5173](http://localhost:5173).

---

## 🧪 Testing Results

Run backend automated tests:
```bash
cd backend
mvn test
```

### Test Suite Summary:
- **`ArcadeStopApplicationTests`**: Verifies Spring context bootstraps correctly.
- **`GameServiceTest`**: Unit tests verifying `getAllGames()`, `getGameBySlug()` success, `getGameBySlug()` 404 throwing, and `getGamesByCategory()`.
- **`GameControllerTest`**: Full mock MVC integration tests verifying:
  - Startup seed data initialization (6 records).
  - `GET /api/games` returns 6 games with correct statuses and JSON format.
  - `GET /api/games/{slug}` returns valid game data.
  - `GET /api/games/{slug}` with invalid slug returns `404 Not Found` with structured error response.
  - `GET /api/games/category/{category}` filters correctly (e.g. 2 reflex games).
  - `GET /api/health` returns `UP` status.

**Result: 11 / 11 tests passed (0 failures, 0 errors, 0 skipped).**

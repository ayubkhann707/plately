# Plately — Smart Meal Planner

Plately is a full-stack social recipe and meal planning web app. Users can discover community recipes, save favorites, create their own recipes, plan weekly meals on a calendar, and generate grocery lists automatically.

The app also features AI-powered recipe extraction from YouTube videos using yt-dlp and GPT-4o-mini.

**Status:** MVP complete, Week 6 stabilization in progress

---

## Core Features

- User authentication (register, login, JWT-based protected routes)
- Social recipe feed — browse, search, and filter community recipes
- Create posts with ingredients, steps, tags, and video URL
- Save recipes to personal library
- Like recipes
- Weekly meal calendar — add/remove recipes to specific days and meal types
- Automatic grocery list generation from meal plan
- AI recipe import from YouTube URLs
- External recipe dataset import

## Planned Features

- Nutrition data (USDA FoodData Central integration)
- Pantry mode — rank recipes by available ingredients
- Recipe ratings
- User profiles
- Mobile layout
- Password reset flow

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Node.js + Express (CommonJS) |
| Database | PostgreSQL via Docker, Prisma ORM |
| Auth | JWT tokens, bcrypt |
| AI | OpenAI GPT-4o-mini + yt-dlp |
| Testing | Jest + Supertest |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop (for local PostgreSQL)
- Python 3.10+ and yt-dlp (for AI import feature)
- OpenAI API key

### 1. Clone the repository

```bash
git clone https://github.com/Sasha-newf/meal-planner-project-se.git
cd meal-planner-project-se
```

### 2. Create environment files

```bash
# Root .env
cp .env.example .env

# Server .env
cp .env.example server/.env
```

Open `server/.env` and fill in the required values (see Environment Variables below).

### 3. Install yt-dlp (required for AI import)

```bash
pip install yt-dlp
```

### 4. Start the database

```bash
docker compose up -d
```

### 5. Install all dependencies

```bash
npm install
npm run install:all
```

### 6. Run database migrations and seed data

```bash
cd server
npx prisma migrate deploy
npx prisma generate
node prisma/seed.js
node scripts/importDummyRecipes.js
cd ..
```

### 7. Run the project

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Environment Variables

### Root `.env`

```
DATABASE_URL=your_postgresql_connection_string
```

### `server/.env`

```
PORT=5001
CORS_ORIGIN=http://localhost:5173

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=any_random_secret_string

OPENAI_API_KEY=your_openai_api_key
```

**Notes:**
- `DATABASE_URL` — use `postgresql://postgres:postgres@localhost:5432/mealplanner` for local Docker, or a Neon/cloud URL for shared development
- `OPENAI_API_KEY` — required for AI recipe import from YouTube. Get one at platform.openai.com
- `JWT_SECRET` — can be any string, used to sign auth tokens

---

## Project Structure

```
meal-planner-project-se/
├── client/          # React + TypeScript frontend
│   └── src/
│       ├── api/         # Axios client with JWT interceptor
│       ├── context/     # AuthContext
│       ├── layout/      # Sidebar navigation
│       ├── components/  # RecipeCard, LibraryRecipeGrid, etc.
│       └── pages/       # Dashboard, Feed, Library, CreatePost, etc.
├── server/          # Node.js + Express backend
│   ├── controllers/ # Route handlers
│   ├── dto/         # Response shaping
│   ├── middleware/  # requireAuth, optionalAuth
│   ├── prisma/      # Schema, migrations, seed
│   ├── routes/      # API routes
│   ├── scripts/     # Data import scripts
│   ├── services/    # Business logic, AI import
│   ├── tests/       # Jest + Supertest tests
│   └── validation/  # Zod schemas
├── docs/            # Project documentation
└── specs/           # Requirements and specifications
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /auth/register | — | Register new user |
| POST | /auth/login | — | Login |
| GET | /posts/feed | optional | All community recipes |
| GET | /posts/mine | required | Your recipes |
| GET | /posts/:id | optional | Single recipe |
| POST | /posts | required | Create recipe post |
| POST | /posts/:id/save | required | Save recipe |
| DELETE | /posts/:id/save | required | Unsave recipe |
| POST | /posts/:id/like | required | Like recipe |
| DELETE | /posts/:id/like | required | Unlike recipe |
| POST | /plan | required | Add recipe to meal plan |
| GET | /plan | required | Get meal plan |
| DELETE | /plan/:id | required | Remove from meal plan |
| GET | /grocery | required | Get grocery list |
| POST | /imports/video | — | Import recipe from YouTube |
| GET | /health | — | Health check |

---

## Running Tests

```bash
cd server
npm test
```

28 tests across 6 test suites covering: auth, imports, save flow, grocery aggregation, meal plan, and timezone handling.

---

## Data Sources

- [DummyJSON Recipes API](https://dummyjson.com/recipes) — demo recipe data (free)
- OpenAI GPT-4o-mini — AI recipe extraction
- yt-dlp — YouTube transcript extraction

---

## Contributing

- Open issues for bugs or feature proposals
- Use feature branches
- Keep pull requests focused and scoped

---

## Database

The project uses PostgreSQL with Prisma ORM.

### Database Files

- `database/schema.sql` — generated SQL schema
- `database/schema.dbml` — DBML database description
- `database/queries.sql` — example SQL queries
- `database/erd.png` — entity relationship diagram
- `docs/database-description.md` — detailed database documentation

### Main Entities

- User
- Post
- Recipe
- Ingredient
- Step
- Save
- Like
- MealPlanItem
- PantryItem
- GroceryShare

### Supported Database Features

The database supports:

- recipe publishing,
- recipe discovery,
- likes and saves,
- weekly meal planning,
- pantry tracking,
- grocery list generation,
- grocery list sharing.

### Performance Optimizations

The schema includes:

- indexed foreign keys,
- composite indexes for meal planning,
- unique constraints,
- many-to-many junction tables,
- normalized entity relationships.

### Example Queries

The project includes SQL queries demonstrating:

1. Top liked recipes
2. Most frequently planned meals
3. Most commonly used ingredients

---

## License

To be defined.

# Smart Meal Planner

Smart Meal Planner is a full‑stack web application that unifies recipe management, nutrition calculation, pantry‑aware recommendations, weekly meal planning, and automatic shopping list generation into a single streamlined workflow.

The system aims to reduce decision fatigue, improve recipe organization, and provide clear nutrition insights for home cooks.

> **Status:** In development (MVP complete, advanced features planned)

---

## 📚 Table of Contents

- [Core Features (MVP)](#-core-features-mvp)
- [Planned Extensions](#-planned-extensions)
- [System Architecture](#-system-architecture)
- [Nutrition Engine](#-nutrition-engine)
- [AI Recipe Extraction (Planned)](#-ai-recipe-extraction-planned)
- [Pantry Mode (Planned)](#-pantry-mode-planned)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Local Development](#-local-development)
- [Project Structure](#-project-structure)
- [Data Sources](#-data-sources)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## Core Features (MVP)

- Structured recipe creation, editing, and storage  
- Automatic calorie and macronutrient calculation  
- Ingredient‑based filtering (include / exclude)  
- Weekly meal planner  
- Consolidated shopping list generation  
- User authentication  

---

## Planned Extensions

- AI‑based recipe extraction from external links  
- Pantry‑based “cook with what you have” recommendations  
- Enhanced tagging and organization  
- Personalized meal recommendations  
- Advanced nutrition analytics  
- Cost estimation integration  
- Barcode scanning (mobile)  
- Collaborative meal planning  

---

## System Architecture

Frontend (React + TypeScript)  
→ Backend API (Node.js + Express)  
→ PostgreSQL (Data Storage)  
→ AI Microservice (Python + LLM API)  
→ USDA FoodData Central API  

### Frontend
- User interface and interaction  
- Meal planning UI  
- Filtering and search controls  
- Data visualization  

### Server
- Authentication
- Recipe CRUD operations
- Nutrition orchestration
- Business logic
- Meal plan + shopping list aggregation

### Database (PostgreSQL)
Stores:
- Users  
- Recipes  
- Ingredients  
- Meal plans  
- Shopping lists  

### AI Microservice (Planned)
- Webpage text extraction and cleaning  
- LLM‑based structured recipe extraction  
- JSON schema validation  
- Ingredient normalization support  

---

## Nutrition Engine

The nutrition engine performs:

1. Ingredient normalization  
2. Fuzzy matching against USDA FoodData Central  
3. Unit conversion (e.g., cups → grams)  
4. Macro aggregation per recipe and per serving  

Nutrition data is sourced from the USDA FoodData Central API (public domain / CC0).

> Note: Volume‑to‑weight conversions rely on ingredient‑specific assumptions. All nutrition values are estimations.

---

## AI Recipe Extraction (Planned)

Pipeline:

1. Retrieve webpage HTML / metadata  
2. Remove boilerplate (ads, navigation, timestamps, irrelevant blocks)  
3. Send cleaned text to an LLM with a constrained output schema  
4. Validate structured JSON output  
5. Persist validated recipe data  

Expected extracted fields:
- Title  
- Ingredients (quantity, unit, normalized name)  
- Steps  
- Servings  
- Prep / cook time  

---

## Pantry Mode (Planned)

- Normalize user‑entered pantry ingredients  
- Compare against recipe ingredient lists  
- Compute match percentage  
- Rank recipes by cookability  
- Highlight missing essentials  

---

## Getting Started

### Prerequisites

- Node.js 18+  
- Python 3.10+ (for AI microservice)  
- PostgreSQL  
- API Keys:
  - USDA FoodData Central  
  - LLM provider (optional)

---

## Environment Variables

### Server
- `DATABASE_URL`
- `FDC_API_KEY`
- `JWT_SECRET`
- `AI_SERVICE_URL`

### AI Microservice (Optional)
- `LLM_API_KEY`  
- `LLM_MODEL`  

---

## Local Development

1. Start PostgreSQL (locally or via Docker).  
2. Install all dependencies:
   - `npm install`
   - `npm run install:all`
3. Run both server and client:
   - `npm run dev`
4. Start AI Microservice (optional):
   - `cd ai-service`
   - `python -m venv .venv`
   - activate environment
   - `pip install -r requirements.txt`
   - `python app.py`

Adjust commands according to your project scripts.

---

## Project Structure

- `/client`
- `/server`
- `/ai-service`
- `/docs`

---

## Data Sources

- USDA FoodData Central — Nutrition data (public domain / CC0)

---

## Roadmap

- Fully automated AI‑based recipe extraction  
- Intelligent pantry‑based ranking  
- Personalized recommendation engine  
- Cost‑aware meal planning  
- Mobile enhancements  

---

## Contributing

- Open issues for bugs or feature proposals  
- Use feature branches  
- Keep pull requests focused and scoped  

---

## License

To be defined.

## Running the project locally

### 1. Clone the repository

```bash
git clone https://github.com/Sasha-newf/meal-planner-project-se.git
cd meal-planner-project-se
```

### 2. Create env file

Copy `.env.example` to `.env`

```bash
cp .env.example .env
```

### 3. Start database

```bash
docker compose up -d
```

### 4. Install all dependencies

```bash
npm install
npm run install:all
```

### 5. Run the project (client and server)

```bash
npm run dev
```

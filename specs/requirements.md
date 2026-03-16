# Requirements Document — Meal Planner

## 1. Functional Requirements

| ID  | Requirement |
|-----|-------------|
| FR1 | Users can register with an email and password |
| FR2 | Users can log in to access their personal account |
| FR3 | Users can create posts with a title and video URL |
| FR4 | Each post can have an associated recipe with servings and prep time |
| FR5 | Recipes can have a list of ingredients with name, quantity, and unit |
| FR6 | Recipes can have step-by-step cooking instructions in ordered steps |
| FR7 | Users can save and unsave posts from other creators |
| FR8 | Users can add recipes to their meal plan for a specific date |
| FR9 | Users can view their meal plan organized by date |

## 2. Non-Functional Requirements

| ID   | Category    | Requirement |
|------|-------------|-------------|
| NFR1 | Security    | Passwords are stored using bcrypt hashing |
| NFR2 | Security    | API routes are protected with JWT authentication |
| NFR3 | Performance | All API endpoints respond within 500ms under normal load |
| NFR4 | Usability   | UI is responsive and works on desktop and mobile browsers |

## 3. User Stories

- **US1:** As a new user, I want to register with my email and password so that I can access the platform.
- **US2:** As a returning user, I want to log in so that I can see my saved posts and meal plan.
- **US3:** As a user, I want to create a post with a video URL so that I can share a recipe with others.
- **US4:** As a user, I want to attach ingredients and steps to my recipe so that others can follow it.
- **US5:** As a user, I want to save posts from other creators so that I can come back to them later.
- **US6:** As a user, I want to add a recipe to my meal plan on a specific date so that I can organize my week.
- **US7:** As a user, I want to view my meal plan by date so that I know what I am cooking each day.
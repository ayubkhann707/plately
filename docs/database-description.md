# Smart Meal Planner Database Description

## Domain Description

Smart Meal Planner is a recipe sharing and meal planning application. Users can create accounts, publish recipe posts, save and like recipes, add recipes to a weekly meal plan, manage pantry items, and generate shareable grocery lists.

The database stores users, recipe posts, recipe details, ingredients, cooking steps, likes, saves, meal plan items, pantry items, and shared grocery list data.

## Main Entities

### User
Stores account data, profile settings, preferred units, preferred ingredients, and avoided ingredients.

### Post
Represents a public recipe post created by a user. It contains the title, video URL, image URL, tags, visibility flag, and creator reference.

### Recipe
Stores structured recipe information connected to a post, such as servings and cooking time.

### Ingredient
Stores ingredients for each recipe, including name, quantity, and unit.

### Step
Stores ordered cooking instructions for each recipe.

### Save
Represents recipes saved by users. It is a many-to-many relationship between User and Post.

### Like
Represents likes given by users to posts. It is also a many-to-many relationship between User and Post.

### MealPlanItem
Stores recipes planned by a user for a specific date and meal type.

### PantryItem
Stores ingredients that a user already has.

### GroceryShare
Stores generated grocery list snapshots with a unique sharing token.

## Relationships

One user can create many posts.  
One post can have one recipe.  
One recipe can have many ingredients.  
One recipe can have many cooking steps.  
Users can save many posts, and posts can be saved by many users.  
Users can like many posts, and posts can be liked by many users.  
One user can have many meal plan items.  
One recipe can appear in many meal plan items.  
One user can have many pantry items.  
One user can create many shared grocery lists.

## Critical User Scenarios

### Recipe discovery
A user opens the feed, views public posts, likes recipes, and saves interesting recipes.

### Recipe creation
A user creates a post with recipe information. The database stores the post, recipe, ingredients, and cooking steps.

### Weekly meal planning
A user adds a recipe to a specific date and meal type. The database stores this as a MealPlanItem.

### Grocery list generation
The app reads planned recipes and their ingredients, aggregates ingredient quantities, checks pantry items, and generates a grocery list.

### Grocery list sharing
The app stores a generated grocery list snapshot in GroceryShare and creates a unique token for sharing.

## SQL Queries

The project includes three SQL queries in `database/queries.sql`:

1. Find the top 5 most liked recipes.
2. Find the most frequently planned recipes.
3. Find the most commonly used ingredients.

These queries demonstrate joins, aggregation, grouping, ordering, and limiting results.

## Indexes and Performance Optimizations

The database uses indexes for frequently queried fields.

`Post.creatorId` is indexed because the app often searches posts by creator.

`Ingredient.recipeId` and `Step.recipeId` are indexed because ingredients and steps are frequently loaded by recipe.

`Save.postId` and `Like.postId` are indexed because the app needs to count saves and likes for posts.

`MealPlanItem.userId_date` is indexed because the app often loads a user's meal plan for a selected week or date range.

`MealPlanItem.recipeId` is indexed because recipes can be used in many meal plan items.

`PantryItem.userId` is indexed because pantry items are loaded per user.

`GroceryShare.token` is unique and indexed because shared grocery lists are accessed by token.

## Database Constraints

Primary keys uniquely identify rows in each main table.

Foreign keys enforce relationships between users, posts, recipes, ingredients, steps, meal plan items, pantry items, likes, saves, and grocery shares.

Unique constraints prevent duplicate user emails, ensure one recipe per post, and ensure every grocery share token is unique.

Composite primary keys in Save and Like prevent the same user from saving or liking the same post multiple times.

## Conclusion

The database schema supports the main features of the Smart Meal Planner application: recipe publishing, recipe discovery, user engagement, weekly meal planning, pantry management, grocery list generation, and shareable grocery lists. The schema is normalized, uses foreign keys to preserve data integrity, and includes indexes for important application queries.
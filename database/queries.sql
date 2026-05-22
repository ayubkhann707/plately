-- 1. Top 5 most liked recipes
SELECT
  r.id,
  r.title,
  COUNT(l.id) AS like_count
FROM "Recipe" r
JOIN "Post" p ON p."recipeId" = r.id
LEFT JOIN "Like" l ON l."postId" = p.id
GROUP BY r.id, r.title
ORDER BY like_count DESC
LIMIT 5;


-- 2. Most frequently planned recipes
SELECT
  r.id,
  r.title,
  COUNT(mpi.id) AS planned_count
FROM "Recipe" r
JOIN "MealPlanItem" mpi ON mpi."recipeId" = r.id
GROUP BY r.id, r.title
ORDER BY planned_count DESC
LIMIT 10;


-- 3. Most used ingredients
SELECT
  i.name,
  COUNT(*) AS usage_count
FROM "Ingredient" i
GROUP BY i.name
ORDER BY usage_count DESC
LIMIT 10;
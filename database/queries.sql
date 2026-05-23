-- 1. Latest posts
SELECT
  id,
  title,
  "createdAt"
FROM "Post"
ORDER BY "createdAt" DESC
LIMIT 5;


-- 2. Posts count by user
SELECT
  u.email,
  COUNT(p.id) AS posts_count
FROM "User" u
LEFT JOIN "Post" p ON p."creatorId" = u.id
GROUP BY u.email
ORDER BY posts_count DESC;


-- 3. Most liked posts
SELECT
  p.title,
  COUNT(l."postId") AS like_count
FROM "Post" p
LEFT JOIN "Like" l ON l."postId" = p.id
GROUP BY p.title
ORDER BY like_count DESC
LIMIT 5;
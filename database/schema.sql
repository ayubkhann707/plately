-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nickname" TEXT,
    "avatarUrl" TEXT,
    "preferredUnits" TEXT NOT NULL DEFAULT 'metric',
    "preferredIngredients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avoidedIngredients" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "creatorId" TEXT NOT NULL,
    "tags" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "servings" INTEGER,
    "timeMinutes" INTEGER,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Step" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Save" (
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Save_pkey" PRIMARY KEY ("userId","postId")
);

-- CreateTable
CREATE TABLE "Like" (
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("userId","postId")
);

-- CreateTable
CREATE TABLE "MealPlanItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mealType" TEXT NOT NULL DEFAULT 'Lunch',
    "plannedServings" INTEGER,

    CONSTRAINT "MealPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PantryItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PantryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroceryShare" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroceryShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Post_creatorId_idx" ON "Post"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_postId_key" ON "Recipe"("postId");

-- CreateIndex
CREATE INDEX "Ingredient_recipeId_idx" ON "Ingredient"("recipeId");

-- CreateIndex
CREATE INDEX "Step_recipeId_idx" ON "Step"("recipeId");

-- CreateIndex
CREATE INDEX "Save_postId_idx" ON "Save"("postId");

-- CreateIndex
CREATE INDEX "Like_postId_idx" ON "Like"("postId");

-- CreateIndex
CREATE INDEX "MealPlanItem_userId_date_idx" ON "MealPlanItem"("userId", "date");

-- CreateIndex
CREATE INDEX "MealPlanItem_recipeId_idx" ON "MealPlanItem"("recipeId");

-- CreateIndex
CREATE INDEX "PantryItem_userId_idx" ON "PantryItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GroceryShare_token_key" ON "GroceryShare"("token");

-- CreateIndex
CREATE INDEX "GroceryShare_token_idx" ON "GroceryShare"("token");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Save" ADD CONSTRAINT "Save_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Save" ADD CONSTRAINT "Save_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanItem" ADD CONSTRAINT "MealPlanItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanItem" ADD CONSTRAINT "MealPlanItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroceryShare" ADD CONSTRAINT "GroceryShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

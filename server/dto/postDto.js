function toPostDto(post, userId) {
  return {
    id: post.id,
    title: post.title,
    videoUrl: post.videoUrl,
    imageUrl: post.imageUrl,
    image: post.imageUrl,
    tags: post.tags ?? [],
    isPublic: post.isPublic ?? true,
    isSaved: post.saves ? post.saves.length > 0 : false,
    isLiked: post.likes
      ? userId
        ? post.likes.some((l) => l.userId === userId)
        : false
      : false,
    likeCount: post.likes ? post.likes.length : 0,
    creator: post.creator
      ? { id: post.creator.id, email: post.creator.email }
      : null,
    recipe: post.recipe
      ? {
          id: post.recipe.id,
          servings: post.recipe.servings,
          timeMinutes: post.recipe.timeMinutes,
          ingredients: post.recipe.ingredients.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
          })),
          steps: post.recipe.steps.map((s) => ({
            order: s.order,
            text: s.text,
          })),
        }
      : null,
  };
}

module.exports = { toPostDto };
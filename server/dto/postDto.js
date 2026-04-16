function toPostDto(post) {
  return {
    id: post.id,
    title: post.title,
    videoUrl: post.videoUrl,

    recipe: post.recipe
      ? {
          id: post.recipe.id,
          servings: post.recipe.servings,
          timeMinutes: post.recipe.timeMinutes,

          ingredients: post.recipe.ingredients.map(i => ({
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
          })),

          steps: post.recipe.steps.map(s => ({
            order: s.order,
            text: s.text,
          })),
        }
      : null,
  };
}

module.exports = {
  toPostDto,
};

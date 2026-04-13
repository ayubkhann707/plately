function normalizeIngredientNames(items) {
  return [...new Set(
    (items || [])
      .map((item) => {
        if (typeof item === "string") return item.trim().toLowerCase();
        if (item && typeof item.name === "string") return item.name.trim().toLowerCase();
        return "";
      })
      .filter(Boolean)
  )];
}

function evaluateIngredients(predicted, expected) {
  const predictedList = normalizeIngredientNames(predicted);
  const expectedList = normalizeIngredientNames(expected);

  const predictedSet = new Set(predictedList);
  const expectedSet = new Set(expectedList);

  const correct = [...predictedSet].filter((x) => expectedSet.has(x));
  const missed = [...expectedSet].filter((x) => !predictedSet.has(x));
  const extra = [...predictedSet].filter((x) => !expectedSet.has(x));

  const precision = predictedSet.size === 0 ? 0 : correct.length / predictedSet.size;
  const recall = expectedSet.size === 0 ? 0 : correct.length / expectedSet.size;

  return {
    precision: Number(precision.toFixed(2)),
    recall: Number(recall.toFixed(2)),
    correct,
    missed,
    extra,
  };
}

module.exports = {
  normalizeIngredientNames,
  evaluateIngredients,
};
const {
  normalizeIngredientNames,
  evaluateIngredients,
} = require("../services/ingredientEval");

describe("ingredientEval", () => {
  test("normalizes ingredient names", () => {
    expect(normalizeIngredientNames([" Milk ", "EGGS", "milk"])).toEqual(["milk", "eggs"]);
  });

  test("supports ingredient objects", () => {
    expect(
      normalizeIngredientNames([
        { name: " Milk " },
        { name: "EGGS" },
      ])
    ).toEqual(["milk", "eggs"]);
  });

  test("computes precision and recall", () => {
    const result = evaluateIngredients(
      ["milk", "eggs", "butter"],
      ["milk", "eggs", "flour"]
    );

    expect(result.precision).toBe(0.67);
    expect(result.recall).toBe(0.67);
    expect(result.missed).toEqual(["flour"]);
    expect(result.extra).toEqual(["butter"]);
  });
});
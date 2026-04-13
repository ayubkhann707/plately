const fs = require("fs");
const path = require("path");
const { evaluateIngredients } = require("../services/ingredientEval");

const cases = JSON.parse(
  fs.readFileSync(path.join(__dirname, "evalCases.json"), "utf-8")
);

let totalPrecision = 0;
let totalRecall = 0;

for (const testCase of cases) {
  const result = evaluateIngredients(
    testCase.predicted,
    testCase.expectedIngredients
  );

  totalPrecision += result.precision;
  totalRecall += result.recall;

  console.log(`\nCase: ${testCase.name}`);
  console.log("Predicted:", testCase.predicted);
  console.log("Expected:", testCase.expectedIngredients);
  console.log("Precision:", result.precision);
  console.log("Recall:", result.recall);
  console.log("Missed:", result.missed);
  console.log("Extra:", result.extra);
}

console.log("\n=== Summary ===");
console.log("Average precision:", (totalPrecision / cases.length).toFixed(2));
console.log("Average recall:", (totalRecall / cases.length).toFixed(2));
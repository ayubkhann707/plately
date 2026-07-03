import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ExternalLink, Plus, Search, X } from "lucide-react";
import api from "../api/client";

type Ingredient = {
  name: string;
  quantity: number | null;
  unit: string | null;
  quantityEstimated?: boolean;
};

type SimilarRecipe = {
  title: string;
  url: string;
  source?: string;
  snippet?: string;
};

type RecipeValidation = {
  confidenceScore: number;
  level: "low" | "medium" | "high";
  warnings: string[];
  possibleMissingIngredients: {
    name: string;
    likelihood: "low" | "medium" | "high";
    reason: string;
  }[];
  summary?: string;
};

type PreviewRecipe = {
  title: string;
  videoUrl: string;
  imageUrl: string | null;
  servings: number | null;
  timeMinutes: number | null;
  ingredients: Ingredient[];
  steps: string[];
};

export default function ImportRecipe() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlFromModal = searchParams.get("url") || "";

  const [videoUrl, setVideoUrl] = useState(urlFromModal);
  const [caption, setCaption] = useState("");
  const [recipe, setRecipe] = useState<PreviewRecipe | null>(null);
  const [validation, setValidation] = useState<RecipeValidation | null>(null);
  const [error, setError] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [estimatingQuantities, setEstimatingQuantities] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [similarRecipes, setSimilarRecipes] = useState<SimilarRecipe[]>([]);
  const [selectedRecipeUrl, setSelectedRecipeUrl] = useState("");
  const [searchingSimilarRecipes, setSearchingSimilarRecipes] = useState(false);
  const [importingFromSource, setImportingFromSource] = useState(false);
  const [showSimilarRecipeFallback, setShowSimilarRecipeFallback] =
    useState(false);

  useEffect(() => {
    if (urlFromModal) {
      setVideoUrl(urlFromModal);
    }
  }, [urlFromModal]);

  async function handlePreview() {
    try {
      setLoadingPreview(true);
      setError("");
      setRecipe(null);
      setValidation(null);
      setIsEditing(false);
      setSimilarRecipes([]);
      setSelectedRecipeUrl("");
      setShowSimilarRecipeFallback(false);

      const response = await api.post("/imports/video/preview", {
        videoUrl,
        caption,
      });

      setRecipe(response.data.recipe);
      setValidation(response.data.validation || null);
      setIsEditing(false);
    } catch (err: any) {
      console.log("IMPORT PREVIEW ERROR:", err);

      const message =
        err?.response?.data?.error || err?.message || "Import failed";

      setError(message);
      setShowSimilarRecipeFallback(true);
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleFindSimilarRecipes() {
    try {
      setSearchingSimilarRecipes(true);
      setError("");
      setSimilarRecipes([]);
      setSelectedRecipeUrl("");

      const response = await api.post("/imports/video/find-similar-recipes", {
        videoUrl,
        caption,
      });

      setSimilarRecipes(response.data.recipes || []);
    } catch (err: any) {
      console.log("FIND SIMILAR RECIPES ERROR:", err);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to find similar recipes"
      );
    } finally {
      setSearchingSimilarRecipes(false);
    }
  }

  async function handleImportFromSource() {
    if (!selectedRecipeUrl) return;

    try {
      setImportingFromSource(true);
      setError("");

      const response = await api.post("/imports/video/import-from-source", {
        selectedUrl: selectedRecipeUrl,
        originalVideoUrl: videoUrl,
      });

      setRecipe(response.data.recipe);
      setValidation(null);
      setIsEditing(false);
      setShowSimilarRecipeFallback(false);
    } catch (err: any) {
      console.log("IMPORT FROM SOURCE ERROR:", err);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to import recipe from selected source"
      );
    } finally {
      setImportingFromSource(false);
    }
  }

  async function handleEstimateQuantities() {
    if (!recipe) return;

    try {
      setEstimatingQuantities(true);
      setError("");

      const response = await api.post("/imports/video/estimate-quantities", {
        recipe,
      });

      setRecipe(response.data.recipe);
    } catch (err: any) {
      console.log("ESTIMATE QUANTITIES ERROR:", err);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to estimate quantities"
      );
    } finally {
      setEstimatingQuantities(false);
    }
  }

  async function handleSave() {
    if (!recipe) return;

    try {
      setSaving(true);
      setError("");

      await api.post("/imports/video/save", recipe);

      navigate("/app/library/saved");
    } catch (err: any) {
      console.log("SAVE IMPORT ERROR:", err);
      setError(err?.response?.data?.error || err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updateIngredient(index: number, field: keyof Ingredient, value: string) {
    if (!recipe) return;

    const nextIngredients = [...recipe.ingredients];

    nextIngredients[index] = {
      ...nextIngredients[index],
      [field]:
        field === "quantity"
          ? value === ""
            ? null
            : Number(value)
          : value,
    };

    if (field === "quantity") {
      nextIngredients[index].quantityEstimated = false;
    }

    setRecipe({
      ...recipe,
      ingredients: nextIngredients,
    });
  }

  function addIngredient() {
    if (!recipe) return;

    setRecipe({
      ...recipe,
      ingredients: [
        ...recipe.ingredients,
        {
          name: "",
          quantity: null,
          unit: "",
          quantityEstimated: false,
        },
      ],
    });
  }

  function removeIngredient(index: number) {
    if (!recipe) return;

    const nextIngredients = recipe.ingredients.filter((_, i) => i !== index);

    setRecipe({
      ...recipe,
      ingredients:
        nextIngredients.length > 0
          ? nextIngredients
          : [{ name: "", quantity: null, unit: "", quantityEstimated: false }],
    });
  }

  function updateStep(index: number, value: string) {
    if (!recipe) return;

    const nextSteps = [...recipe.steps];
    nextSteps[index] = value;

    setRecipe({
      ...recipe,
      steps: nextSteps,
    });
  }

  function addStep() {
    if (!recipe) return;

    setRecipe({
      ...recipe,
      steps: [...recipe.steps, ""],
    });
  }

  function removeStep(index: number) {
    if (!recipe) return;

    const nextSteps = recipe.steps.filter((_, i) => i !== index);

    setRecipe({
      ...recipe,
      steps: nextSteps.length > 0 ? nextSteps : [""],
    });
  }

  const confidencePercent = validation
    ? Math.round(validation.confidenceScore * 100)
    : 0;

  const hasMissingQuantities =
    recipe?.ingredients.some((ingredient) => ingredient.quantity == null) ??
    false;

  const shouldShowFallback =
    showSimilarRecipeFallback ||
    Boolean(
      validation &&
        validation.level === "low" &&
        (!recipe ||
          recipe.ingredients.length === 0 ||
          recipe.steps.length === 0 ||
          recipe.steps.some((step) =>
            step.toLowerCase().includes("follow the cooking method shown")
          ))
    );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Import Recipe
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Import a recipe from video, review it, edit if needed, then save it to your recipes.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          />

          <textarea
            placeholder="Caption / Description"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={5}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
          />

          <button
            onClick={handlePreview}
            disabled={loadingPreview}
            className="rounded-2xl bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
          >
            {loadingPreview ? "Importing..." : "Generate Preview"}
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {shouldShowFallback && (
          <div className="mt-6 rounded-3xl border border-orange-200 bg-orange-50 p-5 text-sm text-orange-900">
            <h2 className="font-semibold text-orange-950">
              Not enough recipe details found
            </h2>
            <p className="mt-2 text-orange-800">
              This video does not contain enough ingredients or cooking steps.
              You can search for similar recipes online, open the links, choose
              the closest one, and import it as the recipe source.
            </p>

            <button
              type="button"
              onClick={handleFindSimilarRecipes}
              disabled={searchingSimilarRecipes}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              <Search size={16} />
              {searchingSimilarRecipes
                ? "Searching..."
                : "Find similar recipes"}
            </button>

            {similarRecipes.length > 0 && (
              <div className="mt-5 space-y-3">
                {similarRecipes.map((item, index) => (
                  <label
                    key={item.url || index}
                    className="flex cursor-pointer gap-3 rounded-2xl border border-orange-100 bg-white p-4"
                  >
                    <input
                      type="radio"
                      name="selectedRecipeUrl"
                      value={item.url}
                      checked={selectedRecipeUrl === item.url}
                      onChange={() => setSelectedRecipeUrl(item.url)}
                      className="mt-1"
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.title}
                          </p>
                          {item.source && (
                            <p className="mt-1 text-xs text-gray-400">
                              {item.source}
                            </p>
                          )}
                        </div>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
                        >
                          Open
                          <ExternalLink size={13} />
                        </a>
                      </div>

                      {item.snippet && (
                        <p className="mt-2 text-xs text-gray-500">
                          {item.snippet}
                        </p>
                      )}
                    </div>
                  </label>
                ))}

                <button
                  type="button"
                  onClick={handleImportFromSource}
                  disabled={!selectedRecipeUrl || importingFromSource}
                  className="rounded-2xl bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
                >
                  {importingFromSource
                    ? "Importing selected recipe..."
                    : "Use selected recipe"}
                </button>
              </div>
            )}
          </div>
        )}

        {validation && (
          <div className="mt-6 rounded-3xl border border-yellow-200 bg-yellow-50 p-5 text-sm text-yellow-900">
            <h2 className="font-semibold text-yellow-950">
              AI Validation Score: {validation.level} ({confidencePercent}%)
            </h2>

            {validation.summary && (
              <p className="mt-2 text-yellow-800">{validation.summary}</p>
            )}

            {validation.warnings?.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold">Warnings:</p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.possibleMissingIngredients?.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold">Possible missing ingredients:</p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {validation.possibleMissingIngredients.map((item, index) => (
                    <li key={index}>
                      <span className="font-medium">{item.name}</span> —{" "}
                      {item.likelihood}: {item.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {recipe && (
          <div className="mt-8 border-t border-gray-100 pt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Generated Recipe
              </h2>

              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                {isEditing ? "Done Editing" : "Edit"}
              </button>
            </div>

            {!isEditing ? (
              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {recipe.title}
                  </h3>

                  <div className="mt-2 flex gap-3 text-sm text-gray-500">
                    <span>{recipe.servings ?? "—"} servings</span>
                    <span>•</span>
                    <span>{recipe.timeMinutes ?? "—"} min</span>
                  </div>
                </section>

                <section>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Ingredients
                    </h3>

                    {hasMissingQuantities && (
                      <button
                        type="button"
                        onClick={handleEstimateQuantities}
                        disabled={estimatingQuantities}
                        className="inline-flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs font-semibold text-yellow-700 hover:bg-yellow-100 disabled:opacity-60"
                      >
                        <AlertTriangle size={14} />
                        {estimatingQuantities
                          ? "Estimating..."
                          : "Estimate missing quantities"}
                      </button>
                    )}
                  </div>

                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    {recipe.ingredients.map((ingredient, index) => {
                      const shouldShowWarning =
                        ingredient.quantity == null ||
                        ingredient.quantityEstimated;

                      return (
                        <li key={index}>
                          <span>
                            {ingredient.quantity ?? ""} {ingredient.unit ?? ""}{" "}
                            {ingredient.name}
                          </span>

                          {shouldShowWarning && (
                            <span
                              title={
                                ingredient.quantityEstimated
                                  ? "This quantity was estimated by AI. Please check manually."
                                  : "Quantity was not detected by AI. Please check manually."
                              }
                              className="ml-2 inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700"
                            >
                              <AlertTriangle size={12} />
                              {ingredient.quantityEstimated
                                ? "Estimated quantity"
                                : "Missing quantity"}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Steps
                  </h3>

                  <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                    {recipe.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </section>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-2xl bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Recipe"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <section>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Recipe title
                  </label>
                  <input
                    value={recipe.title}
                    onChange={(e) =>
                      setRecipe({ ...recipe, title: e.target.value })
                    }
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                  />
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Servings
                    </label>
                    <input
                      type="number"
                      value={recipe.servings ?? ""}
                      onChange={(e) =>
                        setRecipe({
                          ...recipe,
                          servings:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Cooking time
                    </label>
                    <input
                      type="number"
                      value={recipe.timeMinutes ?? ""}
                      onChange={(e) =>
                        setRecipe({
                          ...recipe,
                          timeMinutes:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                    />
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Ingredients
                    </h3>

                    <button
                      type="button"
                      onClick={addIngredient}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <Plus size={14} />
                      Add Ingredient
                    </button>
                  </div>

                  <div className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-3 items-center"
                      >
                        <input
                          placeholder="Name"
                          value={ingredient.name}
                          onChange={(e) =>
                            updateIngredient(index, "name", e.target.value)
                          }
                          className="col-span-5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                        />

                        <input
                          type="number"
                          placeholder="Qty"
                          value={ingredient.quantity ?? ""}
                          onChange={(e) =>
                            updateIngredient(index, "quantity", e.target.value)
                          }
                          className="col-span-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                        />

                        <input
                          placeholder="Unit"
                          value={ingredient.unit ?? ""}
                          onChange={(e) =>
                            updateIngredient(index, "unit", e.target.value)
                          }
                          className="col-span-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                        />

                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="col-span-1 h-11 w-11 rounded-2xl border border-gray-200 flex items-center justify-center"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Steps
                    </h3>

                    <button
                      type="button"
                      onClick={addStep}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <Plus size={14} />
                      Add Step
                    </button>
                  </div>

                  <div className="space-y-3">
                    {recipe.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="mt-3 h-7 w-7 shrink-0 rounded-full bg-green-50 text-green-700 text-xs font-semibold flex items-center justify-center">
                          {index + 1}
                        </div>

                        <input
                          placeholder={`Describe step ${index + 1}`}
                          value={step}
                          onChange={(e) => updateStep(index, e.target.value)}
                          className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                        />

                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="h-11 w-11 rounded-2xl border border-gray-200 flex items-center justify-center"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="mr-3 rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Done Editing
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-2xl bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Recipe"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
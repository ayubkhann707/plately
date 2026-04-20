import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import api from "../api/client";
import { mealTypes, dietaryOptions } from "../constants/recipeFilters";

type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
};

const AVAILABLE_TAGS = [...mealTypes, ...dietaryOptions];

export default function CreatePost() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [servings, setServings] = useState(1);
  const [timeMinutes, setTimeMinutes] = useState(10);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: 0, unit: "" },
  ]);
  const [steps, setSteps] = useState([""]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((item) => item !== tag)
        : [...prev, tag]
    );
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);

      await api.post("/posts", {
        title,
        videoUrl,
        servings,
        timeMinutes,
        ingredients,
        steps,
        tags: selectedTags,
      });

      setTitle("");
      setVideoUrl("");
      setServings(1);
      setTimeMinutes(10);
      setIngredients([{ name: "", quantity: 0, unit: "" }]);
      setSteps([""]);
      setSelectedTags([]);

      navigate("/library");
    } catch (err: any) {
      console.error("Create post error:", err);
      console.error("Server response:", err?.response?.data);

      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Error creating post";

      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Create Post</h1>
          <p className="text-sm text-gray-400 mt-1">
            Add a new recipe and organize it with tags
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Basic Info
              </h2>

              <div className="space-y-4">
                <input
                  placeholder="Recipe title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                />

                <input
                  placeholder="Video URL"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                />
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Recipe Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of servings
                  </label>
                  <input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cooking time (minutes)
                  </label>
                  <input
                    type="number"
                    value={timeMinutes}
                    onChange={(e) => setTimeMinutes(Number(e.target.value))}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">
                  Ingredients
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setIngredients([
                      ...ingredients,
                      { name: "", quantity: 0, unit: "" },
                    ])
                  }
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <Plus size={14} />
                  Add Ingredient
                </button>
              </div>

              <div className="space-y-3">
                {ingredients.map((ing, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 items-center"
                  >
                    <input
                      placeholder="Name"
                      value={ing.name}
                      onChange={(e) => {
                        const next = [...ingredients];
                        next[index].name = e.target.value;
                        setIngredients(next);
                      }}
                      className="col-span-5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                    />

                    <input
                      type="number"
                      placeholder="Qty"
                      value={ing.quantity}
                      onChange={(e) => {
                        const next = [...ingredients];
                        next[index].quantity = Number(e.target.value);
                        setIngredients(next);
                      }}
                      className="col-span-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                    />

                    <input
                      placeholder="Unit"
                      value={ing.unit}
                      onChange={(e) => {
                        const next = [...ingredients];
                        next[index].unit = e.target.value;
                        setIngredients(next);
                      }}
                      className="col-span-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const next = ingredients.filter((_, i) => i !== index);
                        setIngredients(
                          next.length > 0
                            ? next
                            : [{ name: "", quantity: 0, unit: "" }]
                        );
                      }}
                      className="col-span-1 h-11 w-11 rounded-2xl border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Steps</h2>
                <button
                  type="button"
                  onClick={() => setSteps([...steps, ""])}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <Plus size={14} />
                  Add Step
                </button>
              </div>

              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-3 h-7 w-7 shrink-0 rounded-full bg-green-50 text-green-700 text-xs font-semibold flex items-center justify-center">
                      {index + 1}
                    </div>

                    <input
                      placeholder={`Describe step ${index + 1}`}
                      value={step}
                      onChange={(e) => {
                        const next = [...steps];
                        next[index] = e.target.value;
                        setSteps(next);
                      }}
                      className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const next = steps.filter((_, i) => i !== index);
                        setSteps(next.length > 0 ? next : [""]);
                      }}
                      className="h-11 w-11 rounded-2xl border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Tags</h2>

              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                        isSelected
                          ? "bg-green-50 border-green-300 text-green-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="bg-gray-50 border border-gray-100 rounded-3xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Summary
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-800">Title:</span>{" "}
                  {title || "—"}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Servings:</span>{" "}
                  {servings}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Cook time:</span>{" "}
                  {timeMinutes} min
                </p>
                <p>
                  <span className="font-medium text-gray-800">Tags:</span>{" "}
                  {selectedTags.length > 0 ? selectedTags.join(", ") : "—"}
                </p>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-2xl bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}
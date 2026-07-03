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

function getYouTubeThumbnail(url: string) {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    let videoId = "";

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1).split("?")[0];
    }

    if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v") || "";

      if (!videoId && parsed.pathname.includes("/shorts/")) {
        videoId =
          parsed.pathname.split("/shorts/")[1]?.split("/")[0] || "";
      }

      if (!videoId && parsed.pathname.includes("/embed/")) {
        videoId =
          parsed.pathname.split("/embed/")[1]?.split("/")[0] || "";
      }
    }

    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : "";
  } catch {
    return "";
  }
}

export default function CreatePost() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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

  const [error, setError] = useState("");
  async function handleSubmit() {
  setError("");

  if (!title.trim()) {
    setError("Please add a recipe title");
    return;
  }

  if (!videoUrl.trim()) {
    setError("Please add a video URL");
    return;
  }

  const validIngredients = ingredients.filter(i => i.name.trim());
  if (validIngredients.length === 0) {
    setError("Please add at least one ingredient");
    return;
  }

  const validSteps = steps.filter(s => s.trim());
  if (validSteps.length === 0) {
    setError("Please add at least one step");
    return;
  }

  try {
    setSubmitting(true);

    const finalImageUrl = imageUrl.trim() || getYouTubeThumbnail(videoUrl);

    await api.post("/posts", {
      title: title.trim(),
      videoUrl: videoUrl.trim(),
      imageUrl: finalImageUrl,
      servings,
      timeMinutes,
      ingredients: validIngredients,
      steps: validSteps,
      tags: selectedTags,
    });

    setTitle("");
    setVideoUrl("");
    setImageUrl("");
    setServings(1);
    setTimeMinutes(10);
    setIngredients([{ name: "", quantity: 0, unit: "" }]);
    setSteps([""]);
    setSelectedTags([]);
    setError("");

    navigate("/app/library");
  } catch (err: any) {
    console.error("Create post error:", err);
    setError(
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Error creating post"
    );
  } finally {
    setSubmitting(false);
  }
}

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create Post
          </h1>
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

                <input
                  placeholder="Image URL (optional)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
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
                    onChange={(e) =>
                      setServings(Number(e.target.value))
                    }
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
                    onChange={(e) =>
                      setTimeMinutes(Number(e.target.value))
                    }
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
                      className="col-span-5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                    />

                    <input
                      type="number"
                      placeholder="Qty"
                      value={ing.quantity}
                      onChange={(e) => {
                        const next = [...ingredients];
                        next[index].quantity = Number(
                          e.target.value
                        );
                        setIngredients(next);
                      }}
                      className="col-span-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                    />

                    <input
                      placeholder="Unit"
                      value={ing.unit}
                      onChange={(e) => {
                        const next = [...ingredients];
                        next[index].unit = e.target.value;
                        setIngredients(next);
                      }}
                      className="col-span-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const next = ingredients.filter(
                          (_, i) => i !== index
                        );

                        setIngredients(
                          next.length > 0
                            ? next
                            : [
                                {
                                  name: "",
                                  quantity: 0,
                                  unit: "",
                                },
                              ]
                        );
                      }}
                      className="col-span-1 h-11 w-11 rounded-2xl border border-gray-200 flex items-center justify-center"
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
                <h2 className="text-sm font-semibold text-gray-900">
                  Steps
                </h2>

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
                  <div
                    key={index}
                    className="flex items-start gap-3"
                  >
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
                      className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const next = steps.filter(
                          (_, i) => i !== index
                        );
                        setSteps(
                          next.length > 0 ? next : [""]
                        );
                      }}
                      className="h-11 w-11 rounded-2xl border border-gray-200 flex items-center justify-center"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Tags
              </h2>

              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected =
                    selectedTags.includes(tag);

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-2 rounded-full text-sm font-medium border ${
                        isSelected
                          ? "bg-green-50 border-green-300 text-green-700"
                          : "bg-white border-gray-200 text-gray-600"
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
                  <span className="font-medium text-gray-800">
                    Title:
                  </span>{" "}
                  {title || "—"}
                </p>

                <p>
                  <span className="font-medium text-gray-800">
                    Servings:
                  </span>{" "}
                  {servings}
                </p>

                <p>
                  <span className="font-medium text-gray-800">
                    Cook time:
                  </span>{" "}
                  {timeMinutes} min
                </p>

                <p>
                  <span className="font-medium text-gray-800">
                    Tags:
                  </span>{" "}
                  {selectedTags.length > 0
                    ? selectedTags.join(", ")
                    : "—"}
                </p>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-end gap-3">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 w-full">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-2xl bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}
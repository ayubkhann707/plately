import { useState } from "react";
import api from "../api/client";

type Ingredient = {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
};

type Step = {
  id: string;
  order: number;
  text: string;
};

type ImportedPost = {
  id: string;
  title: string;
  videoUrl: string;
  recipe: {
    ingredients: Ingredient[];
    steps: Step[];
  };
};

export default function ImportRecipe() {
  const [videoUrl, setVideoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [result, setResult] = useState<ImportedPost | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await api.post("/imports/video", {
        videoUrl,
        caption,
      });

      setResult(response.data.post);
    } catch (err: any) {
      console.log("IMPORT ERROR:", err);
      console.log("STATUS:", err?.response?.status);
      console.log("DATA:", err?.response?.data);

      setError(
        err?.response?.data?.error ||
        err?.message ||
        "Import failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "800px" }}>
      <h1>Import Recipe</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input
          type="text"
          placeholder="Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />

        <textarea
          placeholder="Caption / Description"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={5}
        />

        <button onClick={handleImport} disabled={loading}>
          {loading ? "Importing..." : "Import Recipe"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", marginTop: "16px" }}>
          {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: "32px" }}>
          <h2>{result.title}</h2>
          <p>{result.videoUrl}</p>

          <h3>Ingredients</h3>
          <ul>
            {result.recipe.ingredients.map((ingredient) => (
              <li key={ingredient.id}>
                {ingredient.quantity ?? ""} {ingredient.unit ?? ""} {ingredient.name}
              </li>
            ))}
          </ul>

          <h3>Steps</h3>
          <ol>
            {result.recipe.steps.map((step) => (
              <li key={step.id}>{step.text}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
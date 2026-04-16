import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

export default function Post() {
  const { id } = useParams();

  const [post, setPost] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadPost() {
      const res = await api.get(`/posts/${id}`);
      setPost(res.data);
    }

    loadPost();
  }, [id]);

  async function handleSave() {
    try {
      await api.post(`/posts/${id}/save`);
      setSaved(true);
      alert("Saved!");
    } catch (err) {
      alert("Error saving post");
    }
  }

  async function handleUnsave() {
    try {
      await api.delete(`/posts/${id}/save`);
      setSaved(false);
      alert("Unsaved!");
    } catch (err) {
      alert("Error unsaving post");
    }
  }

  async function handleAddToPlan() {
    if (!post?.recipe?.id) {
      alert("This post has no recipe to add");
      return;
    }
    try {
      await api.post("/plan", {
        recipeId: post.recipe.id,
        date: new Date().toISOString().split('T')[0]
      });
      alert("Added to plan");
    } catch (err) {
      alert("Error adding to plan");
    }
  }

  if (!post) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        Loading recipes...
      </div>
    );
  }

  return (
    <div>
      <h1>{post.title}</h1>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button
          onClick={saved ? handleUnsave : handleSave}
          style={{
            background: saved ? "#ccc" : "#4CAF50",
            color: "white",
            padding: "8px 16px",
            borderRadius: "20px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {saved ? "Saved ✓" : "Save"}
        </button>

        <button
          onClick={handleAddToPlan}
          style={{
            background: "#2196F3",
            color: "white",
            padding: "8px 16px",
            borderRadius: "20px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Add to Plan
        </button>
      </div>

      <div style={{
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        marginBottom: "16px"
      }}>
        <iframe
          width="100%"
          height="300"
          src={post.videoUrl.replace("watch?v=", "embed/")}
          title="Recipe video"
          frameBorder="0"
          allowFullScreen
        />
      </div>

      {!post.recipe ? (
        <p>No recipe details available for this post.</p>
      ) : (
        <>
          <h2 style={{ marginTop: "20px" }}>Recipe</h2>

          <p>Servings: {post.recipe.servings}</p>
          <p>Time: {post.recipe.timeMinutes} min</p>

          <h4>Ingredients</h4>

          <ul style={{ paddingLeft: "20px" }}>
            {post.recipe.ingredients.map((i: any) => (
              <li key={i.name}>
                {i.name} — {i.quantity} {i.unit}
              </li>
            ))}
          </ul>

          <h4>Steps</h4>

          <ol style={{ paddingLeft: "20px" }}>
            {post.recipe.steps.map((s: any) => (
              <li key={s.order}>{s.text}</li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

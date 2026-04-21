import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  // YouTube normal
  if (url.includes("watch?v=")) {
    return url.replace("watch?v=", "embed/");
  }
  // YouTube shorts
  if (url.includes("/shorts/")) {
    return url.replace("/shorts/", "/embed/");
  }
  return url;
};

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>{post.title}</h1>

        <div style={{ display: "flex", gap: "10px" }}>
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
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "8px", marginBottom: "16px" }}>
        {post.tags?.map((tag: string) => (
          <span
            key={tag}
            style={{
              background: "#eee",
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "0.9rem",
              color: "#555"
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <div style={{
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        marginBottom: "16px"
      }}>
        <iframe
          width="100%"
          height="400"
          src={getEmbedUrl(post.videoUrl)}
          title="Recipe video"
          frameBorder="0"
          allowFullScreen
        />
      </div>

      {!post.recipe ? (
        <p>No recipe details available for this post.</p>
      ) : (
        <>
          <h2 style={{ marginTop: "16px", marginBottom: "12px" }}>Recipe</h2>

          <div style={{ display: "flex", gap: 12, marginBottom: "20px" }}>
            <div style={{ background: "#f5f5f5", padding: "8px 16px", borderRadius: "8px" }}>
              ⏱ {post.recipe.timeMinutes} min
            </div>
            <div style={{ background: "#f5f5f5", padding: "8px 16px", borderRadius: "8px" }}>
              🍽 {post.recipe.servings} servings
            </div>
          </div>

          <h4 style={{ marginBottom: "8px" }}>Ingredients</h4>

          <ul style={{ paddingLeft: 0, listStyleType: "none" }}>
            {post.recipe.ingredients.map((i: any) => (
              <li
                key={i.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #eee"
                }}
              >
                <span>{i.name}</span>
                <span>{i.quantity} {i.unit}</span>
              </li>
            ))}
          </ul>

          <h4 style={{ marginTop: "20px", marginBottom: "8px" }}>Steps</h4>

          <ol style={{ paddingLeft: "20px" }}>
            {post.recipe.steps.map((s: any) => (
              <li key={s.order} style={{ marginBottom: "8px" }}>{s.text}</li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

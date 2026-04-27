import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

const getEmbedUrl = (url: string) => {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    let videoId = "";
    let start = "";

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1).split("?")[0];
    }

    if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v") || "";

      if (!videoId && parsed.pathname.includes("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0] || "";
      }

      if (!videoId && parsed.pathname.includes("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1]?.split("/")[0] || "";
      }
    }

    const timeParam = parsed.searchParams.get("t");

    if (timeParam) {
      start = timeParam.replace("s", "");
    }

    return videoId
      ? `https://www.youtube.com/embed/${videoId}${
          start ? `?start=${start}` : ""
        }`
      : url;
  } catch {
    return url;
  }
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

  const embedUrl = getEmbedUrl(post.videoUrl);
  const isYouTube = embedUrl.includes("youtube.com/embed");

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
        marginBottom: "16px",
        background: "#000",
        position: "relative",
        paddingTop: isYouTube ? "56.25%" : "0", // 16:9 Aspect Ratio for YouTube
        height: isYouTube ? 0 : "400px"
      }}>
        {isYouTube ? (
          <iframe
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%"
            }}
            src={embedUrl}
            title="Recipe video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            padding: "20px",
            textAlign: "center"
          }}>
            <p>This video format cannot be embedded directly.</p>
            <a
              href={post.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#4CAF50",
                textDecoration: "underline",
                marginTop: "10px",
                fontWeight: "bold"
              }}
            >
              Watch video on original platform
            </a>
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Video thumbnail"
                style={{
                  marginTop: "20px",
                  maxHeight: "200px",
                  borderRadius: "8px",
                  opacity: 0.6
                }}
              />
            )}
          </div>
        )}
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

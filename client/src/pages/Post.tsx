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

  if (!post) {
    return <div>Loading...</div>;
  }

  const buttonStyle = {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    background: "#4CAF50",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "12px"
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "16px" }}>
      <h1>{post.title}</h1>

      {saved ? (
        <button style={buttonStyle} onClick={handleUnsave}>✔ Saved</button>
      ) : (
        <button style={buttonStyle} onClick={handleSave}>Save</button>
      )}

      <div style={{
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        marginBottom: "16px"
      }}>
        <iframe
          width="100%"
          height="250"
          src={post.videoUrl.replace("watch?v=", "embed/")}
          title="Recipe video"
          style={{ border: "none" }}
        ></iframe>
      </div>

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
    </div>
  );
}

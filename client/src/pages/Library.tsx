import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import RecipeCard from "../components/RecipeCard";

export default function Library() {
  const [posts, setPosts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSaved() {
      const res = await api.get("/saved");
      setPosts(res.data.map((p: any) => ({ ...p, isSaved: true })));
    }

    loadSaved();
  }, []);

  async function onToggleSave(postId: string) {
    try {
      await api.delete(`/posts/${postId}/save`);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      alert("Error unsaving");
    }
  }

  return (
    <div>
      <h1>Library</h1>

      {posts.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p>No saved recipes yet 🍽</p>
          <p>Go to Feed and save your first recipe!</p>
        </div>
      ) : (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          {posts.map((post) => (
            <RecipeCard 
              key={post.id} 
              post={post} 
              onOpen={() => navigate(`/posts/${post.id}`)} 
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}

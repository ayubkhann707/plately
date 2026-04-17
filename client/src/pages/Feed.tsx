import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import api from "../api/client";
import RecipeCard from "../components/RecipeCard";

export default function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const availableTags = ["vegan", "asian", "dessert", "quick", "healthy"];

  useEffect(() => {
    async function loadFeed() {
      const res = await api.get("/posts/feed");
      setPosts(res.data);
    }

    loadFeed();
  }, []);

  async function onToggleSave(postId: string) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.isSaved) {
        await api.delete(`/posts/${postId}/save`);
      } else {
        await api.post(`/posts/${postId}/save`);
      }
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, isSaved: !p.isSaved } : p
      ));
    } catch (err) {
      alert("Error toggling save");
    }
  }

  const filteredPosts = selectedTag
    ? posts.filter(p => p.tags?.includes(selectedTag))
    : posts;

  return (
    <div>
      <h1>Feed page</h1>

      <Button onClick={() => navigate("/create")}>
        Create Post
      </Button>

      <div style={{ marginBottom: "16px", marginTop: "16px" }}>
        <button 
          onClick={() => setSelectedTag(null)}
          style={{
            background: selectedTag === null ? "#4CAF50" : "#eee",
            color: selectedTag === null ? "white" : "black",
            marginRight: "8px",
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer"
          }}
        >
          All
        </button>
        {availableTags.map(tag => (
          <button 
            key={tag} 
            onClick={() => setSelectedTag(tag)}
            style={{
              background: selectedTag === tag ? "#4CAF50" : "#eee",
              color: selectedTag === tag ? "white" : "black",
              marginRight: "8px",
              padding: "6px 12px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer"
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        marginTop: "16px"
      }}>
        {filteredPosts.map((post: any) => (
          <RecipeCard 
            key={post.id} 
            post={post} 
            onOpen={() => navigate(`/posts/${post.id}`)} 
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    </div>
  );
}
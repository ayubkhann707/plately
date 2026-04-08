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
      setPosts(res.data);
    }

    loadSaved();
  }, []);

  return (
    <div>
      <h1>Library</h1>

      {posts.map((post) => (
        <RecipeCard key={post.id} post={post} onOpen={() => navigate(`/posts/${post.id}`)} />
      ))}
    </div>
  );
}

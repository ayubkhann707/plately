import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import api from "../api/client";
import RecipeCard from "../components/RecipeCard";

interface Post {
  id: string;
  title: string;
}

export default function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function loadFeed() {
      const res = await api.get("/posts/feed");
      setPosts(res.data);
    }

    loadFeed();
  }, []);

  return (
    <div>
      <h1>Feed page</h1>

      <Button onClick={() => navigate("/create")}>
        Create Post
      </Button>

      {posts.map((post: any) => (
        <RecipeCard key={post.id} post={post} onOpen={() => navigate(`/posts/${post.id}`)} />
      ))}
    </div>
  );
}
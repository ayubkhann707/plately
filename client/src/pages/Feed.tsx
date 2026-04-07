import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import api from "../api/client";

interface Post {
  id: string | number;
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

      {posts.map((post) => (
        <Card key={post.id}>
          <h3>{post.title}</h3>
          <Button onClick={() => navigate(`/posts/${post.id}`)}>
            Open
          </Button>
        </Card>
      ))}
    </div>
  );
}
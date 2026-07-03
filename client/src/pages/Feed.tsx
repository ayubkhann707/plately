import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import api from "../api/client";
import RecipeCard from "../components/RecipeCard";

export default function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const availableTags = useMemo(() => {
    const allTags = posts.flatMap((p) => p.tags ?? []);
    return [...new Set(allTags)].slice(0, 8);
  }, [posts]);

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await api.get("/posts/feed");
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to load feed", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  async function onToggleSave(postId: string) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    try {
      if (post.isSaved) {
        await api.delete(`/posts/${postId}/save`);
      } else {
        await api.post(`/posts/${postId}/save`);
      }
      setPosts(posts.map((p) =>
        p.id === postId ? { ...p, isSaved: !p.isSaved } : p
      ));
    } catch (err) {
      console.error("Error toggling save", err);
    }
  }

  async function onToggleLike(postId: string) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    try {
      if (post.isLiked) {
        await api.delete(`/posts/${postId}/like`);
      } else {
        await api.post(`/posts/${postId}/like`);
      }
      setPosts(posts.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likeCount: (p.likeCount ?? 0) + (p.isLiked ? -1 : 1) }
          : p
      ));
    } catch (err) {
      console.error("Error toggling like", err);
    }
  }

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (selectedTag) {
      result = result.filter((p) => p.tags?.includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
          p.recipe?.ingredients?.some((i: any) =>
            i.name?.toLowerCase().includes(q)
          )
      );
    }

    return result;
  }, [posts, selectedTag, searchQuery]);

  return (
    <div className="flex flex-col min-w-0">
      <header className="bg-white border border-gray-100 rounded-3xl px-6 md:px-8 py-6 mb-6 shadow-sm">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold text-gray-900">Discover</h1>
          <p className="text-sm text-gray-400 mt-1">
            Browse recipes shared by the community
          </p>
        </div>

        <div className="relative mb-4 max-w-md">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search recipes or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all placeholder:text-gray-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedTag === null
                ? "bg-green-500 text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedTag === tag
                  ? "bg-green-500 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500 text-sm">
          Loading recipes...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <p className="text-base font-semibold text-gray-900">No recipes found</p>
          <p className="text-sm text-gray-400 mt-1">
            {selectedTag || searchQuery
              ? "Try a different search or filter"
              : "Be the first to share a recipe!"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium text-gray-500">
            Showing {filteredPosts.length} recipe{filteredPosts.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPosts.map((post: any) => (
              <RecipeCard
                key={post.id}
                post={post}
                onOpen={() => navigate(`/app/posts/${post.id}`)}
                onToggleSave={onToggleSave}
                onToggleLike={onToggleLike}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

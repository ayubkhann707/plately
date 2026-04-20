import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import api from "../api/client";
import RecipeFilter, { type FilterState } from "../components/RecipeFilter";
import LibraryRecipeGrid, {
  type LibraryPost,
} from "../components/LibraryRecipeGrid";

type SortOption = "newest" | "popular" | "quickest" | "title";

export default function Saved() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<LibraryPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    mealType: [],
    dietary: [],
    cookTime: "",
    difficulty: "",
    savedOnly: true,
    importedOnly: false,
  });

  useEffect(() => {
    async function loadSaved() {
      try {
        const res = await api.get("/saved");
        setPosts(res.data.map((p: LibraryPost) => ({ ...p, isSaved: true })));
      } catch (err) {
        console.error("Failed to load saved recipes", err);
      } finally {
        setLoading(false);
      }
    }

    loadSaved();
  }, []);

  async function onToggleSave(postId: string) {
    try {
      await api.delete(`/posts/${postId}/save`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Error unsaving", err);
      alert("Error removing saved recipe");
    }
  }

  const hasActiveFilters =
    filters.mealType.length > 0 ||
    filters.dietary.length > 0 ||
    filters.cookTime ||
    filters.difficulty ||
    filters.savedOnly ||
    filters.importedOnly;

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      result = result.filter((post) => {
        const titleMatch = post.title.toLowerCase().includes(q);
        const tagMatch = post.tags?.some((tag) => tag.toLowerCase().includes(q));
        const ingredientMatch = post.recipe?.ingredients?.some((ingredient) =>
          ingredient.name.toLowerCase().includes(q)
        );

        return titleMatch || tagMatch || ingredientMatch;
      });
    }

    if (filters.mealType.length > 0) {
      result = result.filter((post) =>
        filters.mealType.some((type) =>
          post.tags?.some((tag) => tag.toLowerCase() === type.toLowerCase())
        )
      );
    }

    if (filters.dietary.length > 0) {
      result = result.filter((post) =>
        filters.dietary.some((diet) =>
          post.tags?.some((tag) => tag.toLowerCase() === diet.toLowerCase())
        )
      );
    }

    if (filters.cookTime) {
      const limit = Number(filters.cookTime);

      result = result.filter((post) => {
        const time = post.recipe?.timeMinutes;
        if (!time) return false;

        if (limit === 15) return time < 15;
        if (limit === 30) return time >= 15 && time <= 30;
        if (limit === 60) return time > 30 && time <= 60;
        if (limit === 120) return time > 60;

        return true;
      });
    }

    if (filters.importedOnly) {
      result = result.filter((post) => Boolean(post.videoUrl));
    }

    if (sortBy === "quickest") {
      result.sort(
        (a, b) => (a.recipe?.timeMinutes ?? 9999) - (b.recipe?.timeMinutes ?? 9999)
      );
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "popular") {
      result.sort((a, b) => (b.tags?.length ?? 0) - (a.tags?.length ?? 0));
    }

    return result;
  }, [posts, searchQuery, filters, sortBy]);

  return (
    <div className="flex flex-col min-w-0">
      <header className="bg-white border border-gray-100 rounded-3xl px-6 md:px-8 py-6 mb-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Saved Recipes</h1>
          <p className="text-sm text-gray-400 mt-1">
            Your favorite recipes saved for later
          </p>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center gap-3">
          <div className="relative flex-1 xl:max-w-md">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search saved recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                hasActiveFilters
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-green-500 ml-1" />}
            </button>

            <div className="relative group">
              <button className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                <span>
                  Sort:{" "}
                  {sortBy === "newest"
                    ? "Newest"
                    : sortBy === "popular"
                    ? "Popular"
                    : sortBy === "quickest"
                    ? "Quickest"
                    : "Title"}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-lg hidden group-hover:block z-20">
                {(["newest", "popular", "quickest", "title"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      sortBy === option
                        ? "bg-green-50 text-green-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    } first:rounded-t-xl last:rounded-b-xl`}
                  >
                    {option === "newest"
                      ? "Newest"
                      : option === "popular"
                      ? "Popular"
                      : option === "quickest"
                      ? "Quickest"
                      : "Title A-Z"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex gap-6">
        {showFilters && (
          <RecipeFilter
            filters={filters}
            onFilterChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500">
              Loading saved recipes...
            </div>
          ) : (
            <LibraryRecipeGrid
              posts={filteredPosts}
              onOpen={(postId) => navigate(`/posts/${postId}`)}
              onToggleSave={onToggleSave}
            />
          )}
        </div>
      </div>
    </div>
  );
}
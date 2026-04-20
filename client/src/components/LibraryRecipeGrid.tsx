import { Star, Clock, Users, Heart, Bookmark } from "lucide-react";

type Ingredient = {
  name: string;
  quantity?: number;
  unit?: string;
};

type Step = {
  order: number;
  text: string;
};

type RecipeData = {
  servings?: number;
  timeMinutes?: number;
  ingredients?: Ingredient[];
  steps?: Step[];
};

export type LibraryPost = {
  id: string;
  title: string;
  videoUrl?: string;
  tags?: string[];
  isSaved?: boolean;
  liked?: boolean;
  image?: string;
  calories?: number;
  rating?: number;
  reviews?: number;

  recipe?: RecipeData;

  servings?: number;
  timeMinutes?: number;
  ingredients?: Ingredient[];
  steps?: Step[];
};

interface LibraryRecipeGridProps {
  posts: LibraryPost[];
  onOpen: (postId: string) => void;
  onToggleSave: (postId: string) => void;
}

const tagColorMap: Record<string, string> = {
  "High Protein": "bg-blue-50 text-blue-600",
  "Gluten-Free": "bg-amber-50 text-amber-600",
  Vegan: "bg-green-50 text-green-600",
  Vegetarian: "bg-emerald-50 text-emerald-600",
  Quick: "bg-cyan-50 text-cyan-600",
  "High Fiber": "bg-lime-50 text-lime-600",
  "Dairy-Free": "bg-orange-50 text-orange-600",
  Keto: "bg-purple-50 text-purple-600",
};

function getServings(post: LibraryPost) {
  return post.recipe?.servings ?? post.servings ?? 1;
}

function getTimeMinutes(post: LibraryPost) {
  return post.recipe?.timeMinutes ?? post.timeMinutes ?? 0;
}

function getIngredients(post: LibraryPost) {
  return post.recipe?.ingredients ?? post.ingredients ?? [];
}

function getPreviewText(post: LibraryPost) {
  const ingredients = getIngredients(post);
  if (ingredients.length > 0) {
    return ingredients.map((i) => i.name).join(", ");
  }
  return "Open recipe to view ingredients";
}

function RecipeCardItem({
  post,
  onOpen,
  onToggleSave,
}: {
  post: LibraryPost;
  onOpen: (postId: string) => void;
  onToggleSave: (postId: string) => void;
}) {
  const timeMinutes = getTimeMinutes(post);
  const servings = getServings(post);
  const previewText = getPreviewText(post);

  return (
    <div
      onClick={() => onOpen(post.id)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
    >
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="absolute top-3 right-3 flex gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={`p-1.5 rounded-full backdrop-blur-sm transition-all ${
              post.liked ? "bg-red-500 text-white" : "bg-white/80 text-gray-600 hover:bg-white"
            }`}
          >
            <Heart size={13} fill={post.liked ? "currentColor" : "none"} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(post.id);
            }}
            className={`p-1.5 rounded-full backdrop-blur-sm transition-all ${
              post.isSaved ? "bg-green-500 text-white" : "bg-white/80 text-gray-600 hover:bg-white"
            }`}
          >
            <Bookmark size={13} fill={post.isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        {!!post.tags?.length && (
          <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-2">
          {post.title}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          <Star size={11} className="text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold text-gray-700">
            {post.rating ?? 4.5}
          </span>
          <span className="text-xs text-gray-400">
            ({post.reviews ?? 0})
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-gray-400" />
            {timeMinutes} min
          </span>

          <span className="flex items-center gap-1">
            <Users size={12} className="text-gray-400" />
            {servings}
          </span>

          <span className="font-semibold text-gray-700">
            {post.calories ?? 0} kcal
          </span>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {previewText}
        </p>

        {!!post.tags?.length && (
          <div className="flex gap-1 flex-wrap">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  tagColorMap[tag] || "bg-gray-100 text-gray-600"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LibraryRecipeGrid({
  posts,
  onOpen,
  onToggleSave,
}: LibraryRecipeGridProps) {
  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Clock size={20} className="text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No recipes found</h3>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="text-xs font-medium text-gray-500">
            Showing {posts.length} recipe{posts.length !== 1 ? "s" : ""}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {posts.map((post) => (
              <RecipeCardItem
                key={post.id}
                post={post}
                onOpen={onOpen}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
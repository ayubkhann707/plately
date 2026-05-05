import "./Dashboard.css";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import {
  Bell,
  Bookmark,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  Flame,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Share2,
  Star,
  Users,
  Wheat,
} from "lucide-react";

type MealType = "Breakfast" | "Lunch" | "Dinner";

type FeedPost = {
  id: number;
  user: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  image?: string;
  recipe?: string;
  likes: number;
  comments: number;
  timeAgo: string;
  liked?: boolean;
};

type Recipe = {
  id: number;
  title: string;
  image: string;
  time: string;
  servings: number;
  rating: number;
  reviews: number;
  tags: string[];
  calories: number;
  saved?: boolean;
  liked?: boolean;
};

type MealSlot = {
  type: MealType;
  time?: string;
};

type MealPlanItem = {
  id: string;
  date: string;
  mealType: MealType;
  recipe: {
    post: {
      id: string;
      title: string;
      imageUrl?: string;
      tags?: string[];
    };
  };
};

type DayPlan = {
  day: string;
  date: string;
  fullDate: string;
  isToday: boolean;
  meals: MealSlot[];
};

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date) {
  return formatDateForApi(a) === formatDateForApi(b);
}

function formatWeekLabel(start: Date) {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startText = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const endText = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startText} – ${endText}`;
}

function getWeekData(weekStart: Date): DayPlan[] {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: String(date.getDate()),
      fullDate: formatDateForApi(date),
      isToday: isSameDay(date, today),
      meals: [{ type: "Breakfast" }, { type: "Lunch" }, { type: "Dinner" }],
    };
  });
}

const feedPosts: FeedPost[] = [
  {
    id: 1,
    user: {
      name: "Jamie Torres",
      handle: "@jamiecooks",
      avatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=60",
    },
    content:
      "Made this incredible lemon tart last night — my family absolutely loved it!",
    image:
      "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=300",
    recipe: "Classic Lemon Tart",
    likes: 142,
    comments: 23,
    timeAgo: "2h ago",
    liked: true,
  },
  {
    id: 2,
    user: {
      name: "Nora Kim",
      handle: "@norakitchen",
      avatar:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=60",
    },
    content:
      "Week 3 of eating plant-based — feeling incredible. Here's what I had for dinner!",
    image:
      "https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=300",
    likes: 98,
    comments: 14,
    timeAgo: "5h ago",
  },
  {
    id: 3,
    user: {
      name: "Marco Delgado",
      handle: "@marcorecipes",
      avatar:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60",
    },
    content:
      "Just shared my grandmother's secret pasta recipe — took me 3 years to finally get it right.",
    recipe: "Nonna's Sunday Pasta",
    likes: 315,
    comments: 47,
    timeAgo: "1d ago",
  },
];

const recipes: Recipe[] = [
  {
    id: 1,
    title: "Lemon Herb Roasted Chicken",
    image:
      "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=400",
    time: "55 min",
    servings: 4,
    rating: 4.8,
    reviews: 234,
    tags: ["High Protein", "Gluten-Free"],
    calories: 420,
    saved: true,
  },
  {
    id: 2,
    title: "Mango Coconut Chia Pudding",
    image:
      "https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=400",
    time: "10 min",
    servings: 2,
    rating: 4.6,
    reviews: 118,
    tags: ["Vegan", "Breakfast"],
    calories: 280,
    liked: true,
  },
  {
    id: 3,
    title: "Mediterranean Veggie Wrap",
    image:
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
    time: "20 min",
    servings: 2,
    rating: 4.4,
    reviews: 87,
    tags: ["Vegetarian", "Quick"],
    calories: 350,
  },
  {
    id: 4,
    title: "Spiced Lentil Soup",
    image:
      "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=400",
    time: "40 min",
    servings: 6,
    rating: 4.7,
    reviews: 195,
    tags: ["Vegan", "High Fiber"],
    calories: 310,
  },
];

function Header({ weekLabel }: { weekLabel: string }) {
  return (
    <header className="plan-header">
      <div className="plan-header__title-wrap">
        <h1 className="plan-header__title">This Week&apos;s Plan</h1>
        <p className="plan-header__subtitle">{weekLabel}</p>
      </div>

      <div className="plan-header__search">
        <SearchIcon />
        <input type="text" placeholder="Search recipes..." />
      </div>

      <button className="plan-icon-btn">
        <Bell size={18} />
        <span className="plan-notification-dot" />
      </button>

      <button className="plan-add-btn">
        <Plus size={15} />
        Add Meal
      </button>

      <button className="plan-view-btn">
        Week view
        <ChevronDown size={14} />
      </button>
    </header>
  );
}

function TodaySummary() {
  const stats = [
    {
      label: "Calories",
      value: "1,840",
      goal: "2,200",
      icon: <Flame size={14} />,
      cardClass: "orange",
    },
    {
      label: "Protein",
      value: "94g",
      goal: "120g",
      icon: <ChefHat size={14} />,
      cardClass: "blue",
    },
    {
      label: "Carbs",
      value: "210g",
      goal: "250g",
      icon: <Wheat size={14} />,
      cardClass: "amber",
    },
    {
      label: "Water",
      value: "1.8L",
      goal: "2.5L",
      icon: <Droplets size={14} />,
      cardClass: "cyan",
    },
  ];

  return (
    <div className="plan-summary-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="plan-summary-card">
          <div className={`plan-summary-card__icon ${stat.cardClass}`}>
            {stat.icon}
          </div>
          <div>
            <p className="plan-summary-card__label">{stat.label}</p>
            <p className="plan-summary-card__value">
              {stat.value} <span>/ {stat.goal}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MealCell({
  items,
  fallbackMeal,
  onClick,
}: {
  items: MealPlanItem[];
  fallbackMeal: MealSlot;
  onClick?: () => void;
}) {
  if (!items.length) {
    return (
      <div className="plan-meal-empty">
        <Plus size={14} />
      </div>
    );
  }

  const firstItem = items[0];
  const title =
    items.length === 1
      ? firstItem.recipe.post.title
      : `${items.length} recipes planned`;

  return (
    <div className="plan-meal-card" onClick={onClick} style={{ cursor: "pointer" }}>
      {firstItem.recipe.post.imageUrl ? (
        <img
          src={firstItem.recipe.post.imageUrl}
          alt={firstItem.recipe.post.title}
          className="plan-meal-card__image"
        />
      ) : null}

      <div className="plan-meal-card__content">
        <p className="plan-meal-card__title">{title}</p>

        <p className="plan-meal-card__time">
          <Clock size={9} /> {fallbackMeal.time}
        </p>

        {items.length > 1 ? (
          <span className="plan-meal-card__tag">Tap to choose</span>
        ) : firstItem.recipe.post.tags?.length ? (
          <span className="plan-meal-card__tag">
            {firstItem.recipe.post.tags[0]}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function WeeklyPlan({
  weekData,
  planItems,
  onOpenSlot,
}: {
  weekData: DayPlan[];
  planItems: MealPlanItem[];
  onOpenSlot: (items: MealPlanItem[], title: string) => void;
}) {
  const mealTypes: MealType[] = ["Breakfast", "Lunch", "Dinner"];

  function getItemsForSlot(day: DayPlan, mealType: MealType) {
    return planItems.filter((item) => {
      const itemDate = item.date.slice(0, 10);
      return itemDate === day.fullDate && item.mealType === mealType;
    });
  }

  function getMealTime(mealType: MealType) {
    if (mealType === "Breakfast") return "8:00 AM";
    if (mealType === "Lunch") return "12:30 PM";
    return "7:00 PM";
  }

  return (
    <div className="plan-weekly-card">
      <div className="plan-weekly-grid">
        <div className="plan-weekly-grid__corner" />

        {weekData.map((day) => (
          <div
            key={day.fullDate}
            className={`plan-weekly-grid__day ${day.isToday ? "is-today" : ""}`}
          >
            <p className="plan-weekly-grid__day-name">{day.day}</p>
            <p className="plan-weekly-grid__day-date">{day.date}</p>
            {day.isToday ? <div className="plan-weekly-grid__today-dot" /> : null}
          </div>
        ))}

        {mealTypes.map((mealType, mealIdx) => (
          <Fragment key={mealType}>
            <div
              className={`plan-weekly-grid__label ${
                mealIdx < 2 ? "plan-weekly-grid__label--border" : ""
              }`}
            >
              <span>{mealType}</span>
            </div>

            {weekData.map((day) => {
              const items = getItemsForSlot(day, mealType);

              const fallbackMeal: MealSlot = {
                ...day.meals[mealIdx],
                time: getMealTime(mealType),
              };

              return (
                <div
                  key={`${day.fullDate}-${mealType}`}
                  className={`plan-weekly-grid__cell ${
                    mealIdx < 2 ? "plan-weekly-grid__cell--border" : ""
                  } ${day.isToday ? "is-today" : ""}`}
                >
                  <MealCell
                    items={items}
                    fallbackMeal={fallbackMeal}
                    onClick={
                      items.length
                        ? () => onOpenSlot(items, `${day.day} ${day.date} · ${mealType}`)
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function SlotRecipesModal({
  items,
  title,
  onClose,
  onDelete,
  selectedGroceryItemIds,
  onToggleGroceryItem,
}: {
  items: MealPlanItem[];
  title: string;
  onClose: () => void;
  onDelete: (itemId: string) => void;
  selectedGroceryItemIds: string[];
  onToggleGroceryItem: (itemId: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "28px",
          padding: "28px",
          width: "min(650px, 95vw)",
          boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Choose recipe</h2>
            <p style={{ margin: "6px 0 0", color: "#94a3b8" }}>{title}</p>
          </div>

          <button
            onClick={onClose}
            style={{
              border: "1px solid #e5e7eb",
              background: "white",
              borderRadius: "14px",
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{ display: "flex", gap: "10px", alignItems: "stretch" }}
            >
              <label
                style={{
                  width: "46px",
                  border: "1px solid #bbf7d0",
                  background: selectedGroceryItemIds.includes(item.id)
                    ? "#dcfce7"
                    : "#f0fdf4",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedGroceryItemIds.includes(item.id)}
                  onChange={() => onToggleGroceryItem(item.id)}
                />
              </label>

              <button
                onClick={() => navigate(`/posts/${item.recipe.post.id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flex: 1,
                  padding: "12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "18px",
                  background: "white",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {item.recipe.post.imageUrl ? (
                  <img
                    src={item.recipe.post.imageUrl}
                    alt={item.recipe.post.title}
                    style={{
                      width: "56px",
                      height: "56px",
                      objectFit: "cover",
                      borderRadius: "14px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "14px",
                      background: "#f1f5f9",
                    }}
                  />
                )}

                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: "#111827" }}>
                    {item.recipe.post.title}
                  </p>

                  {item.recipe.post.tags?.length ? (
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: "#94a3b8",
                        fontSize: "13px",
                      }}
                    >
                      {item.recipe.post.tags.join(", ")}
                    </p>
                  ) : null}
                </div>
              </button>

              <button
                onClick={() => onDelete(item.id)}
                style={{
                  border: "1px solid #fecaca",
                  background: "#fef2f2",
                  color: "#dc2626",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecipeCards() {
  return (
    <div className="plan-section">
      <div className="plan-section__header">
        <div>
          <h2 className="plan-section__title">Suggested Recipes</h2>
          <p className="plan-section__subtitle">Based on your preferences</p>
        </div>
        <button className="plan-link-btn">View all</button>
      </div>

      <div className="plan-recipes-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="plan-recipe-card">
            <div className="plan-recipe-card__image-wrap">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="plan-recipe-card__image"
              />

              <div className="plan-recipe-card__actions">
                <button
                  className={`plan-circle-btn ${recipe.liked ? "is-liked" : ""}`}
                >
                  <Heart size={13} fill={recipe.liked ? "currentColor" : "none"} />
                </button>
                <button
                  className={`plan-circle-btn ${recipe.saved ? "is-saved" : ""}`}
                >
                  <Bookmark size={13} fill={recipe.saved ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="plan-recipe-card__tags">
                {recipe.tags.map((tag) => (
                  <span key={tag} className="plan-recipe-card__tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="plan-recipe-card__body">
              <h3 className="plan-recipe-card__title">{recipe.title}</h3>

              <div className="plan-recipe-card__rating">
                <Star size={11} className="plan-star" />
                <span className="plan-recipe-card__rating-value">{recipe.rating}</span>
                <span className="plan-recipe-card__reviews">({recipe.reviews})</span>
              </div>

              <div className="plan-recipe-card__meta">
                <span>
                  <Clock size={12} /> {recipe.time}
                </span>
                <span>
                  <Users size={12} /> {recipe.servings} servings
                </span>
                <span className="plan-recipe-card__kcal">{recipe.calories} kcal</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedCard({ post }: { post: FeedPost }) {
  return (
    <div className="plan-feed-card">
      <div className="plan-feed-card__top">
        <div className="plan-feed-card__user">
          <img
            src={post.user.avatar}
            alt={post.user.name}
            className="plan-feed-card__avatar"
          />
          <div>
            <p className="plan-feed-card__name">{post.user.name}</p>
            <p className="plan-feed-card__handle">
              {post.user.handle} · {post.timeAgo}
            </p>
          </div>
        </div>

        <button className="plan-feed-card__more">
          <MoreHorizontal size={15} />
        </button>
      </div>

      <p className="plan-feed-card__content">{post.content}</p>

      {post.image ? (
        <div className="plan-feed-card__image-wrap">
          <img src={post.image} alt="post" className="plan-feed-card__image" />
        </div>
      ) : null}

      {post.recipe ? (
        <div className="plan-feed-card__recipe">
          <div className="plan-feed-card__recipe-dot" />
          <p>{post.recipe}</p>
          <span>View recipe →</span>
        </div>
      ) : null}

      <div className="plan-feed-card__footer">
        <button className={`plan-feed-card__action ${post.liked ? "is-liked" : ""}`}>
          <Heart size={14} fill={post.liked ? "currentColor" : "none"} />
          {post.likes}
        </button>

        <button className="plan-feed-card__action">
          <MessageCircle size={14} />
          {post.comments}
        </button>

        <button className="plan-feed-card__action plan-feed-card__share">
          <Share2 size={13} />
          Share
        </button>
      </div>
    </div>
  );
}

function CommunityFeed() {
  return (
    <div className="plan-community">
      <div className="plan-community__header">
        <h2 className="plan-section__title">Community</h2>
        <button className="plan-link-btn">Explore</button>
      </div>

      <div className="plan-community__list">
        {feedPosts.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>

      <button className="plan-community__load">Load more posts</button>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="plan-search-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()));
  const [planItems, setPlanItems] = useState<MealPlanItem[]>([]);
  const [selectedSlotItems, setSelectedSlotItems] = useState<MealPlanItem[]>([]);
  const [selectedSlotTitle, setSelectedSlotTitle] = useState("");
  const [selectedGroceryItemIds, setSelectedGroceryItemIds] = useState<string[]>([]);

  const weekData = useMemo(() => getWeekData(weekStart), [weekStart]);
  const weekLabel = useMemo(() => formatWeekLabel(weekStart), [weekStart]);

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    return end;
  }, [weekStart]);

  useEffect(() => {
    async function loadPlan() {
      try {
        const res = await api.get("/plan");
        setPlanItems(res.data);
      } catch (err) {
        console.error("Failed to load meal plan", err);
      }
    }

    loadPlan();
  }, []);

  function goToPreviousWeek() {
    setWeekStart((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() - 7);
      return next;
    });
  }

  function goToNextWeek() {
    setWeekStart((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() + 7);
      return next;
    });
  }

  function goToCurrentWeek() {
    setWeekStart(getStartOfWeek(new Date()));
  }

  function openSlotModal(items: MealPlanItem[], title: string) {
    setSelectedSlotItems(items);
    setSelectedSlotTitle(title);
  }

  function closeSlotModal() {
    setSelectedSlotItems([]);
    setSelectedSlotTitle("");
  }

  function toggleGroceryItem(itemId: string) {
    setSelectedGroceryItemIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId]
    );
  }

  function clearGroceryCache() {
    const token = localStorage.getItem("token") || "anon";

    localStorage.removeItem("grocery_snapshot_v2");
    localStorage.removeItem("grocery_checked");
    localStorage.removeItem("grocery_manual");

    localStorage.removeItem(`grocery_snapshot_v2:${token}`);
    localStorage.removeItem(`grocery_checked:${token}`);
    localStorage.removeItem(`grocery_manual:${token}`);
  }

  function handleGenerateGroceryList() {
    if (selectedGroceryItemIds.length === 0) {
      alert("Please select at least one recipe from the calendar first");
      return;
    }

    clearGroceryCache();

    const groceryUrl = `/grocery?planItemIds=${encodeURIComponent(
      selectedGroceryItemIds.join(",")
    )}`;

    localStorage.setItem("grocery_last_url", groceryUrl);
    navigate(groceryUrl);
  }

  function handleGenerateWeeklyGroceryList() {
    clearGroceryCache();

    const groceryUrl = `/grocery?from=${formatDateForApi(
      weekStart
    )}&to=${formatDateForApi(weekEnd)}`;

    localStorage.setItem("grocery_last_url", groceryUrl);
    navigate(groceryUrl);
  }

  async function handleDeletePlanItem(itemId: string) {
    try {
      await api.delete(`/plan/${itemId}`);

      setPlanItems((current) => current.filter((item) => item.id !== itemId));

      setSelectedSlotItems((current) => {
        const updated = current.filter((item) => item.id !== itemId);

        if (updated.length === 0) {
          setSelectedSlotTitle("");
        }

        return updated;
      });

      setSelectedGroceryItemIds((current) =>
        current.filter((id) => id !== itemId)
      );
    } catch (err) {
      alert("Error deleting recipe from plan");
    }
  }

  return (
    <div className="plan-main-shell">
      <Header weekLabel={weekLabel} />

      <div className="plan-content">
        <div className="plan-main">
          <TodaySummary />

          <div className="plan-section">
            <div className="plan-section__header">
              <div>
                <h2 className="plan-section__title">Weekly Overview</h2>
                <p className="plan-section__subtitle">
                  Click a planned slot to choose, open, delete, or add recipes to grocery list
                </p>
              </div>

              <div className="plan-section__actions">
                <button className="plan-secondary-btn" onClick={goToPreviousWeek}>
                  <ChevronLeft size={16} />
                </button>

                <button className="plan-secondary-btn" onClick={goToCurrentWeek}>
                  Today
                </button>

                <button className="plan-secondary-btn" onClick={goToNextWeek}>
                  <ChevronRight size={16} />
                </button>

                <button
                  className="plan-primary-outline-btn"
                  onClick={handleGenerateGroceryList}
                >
                  Add selected to grocery list
                </button>

                <button
                  className="plan-primary-outline-btn"
                  onClick={handleGenerateWeeklyGroceryList}
                >
                  Generate weekly grocery list
                </button>
              </div>
            </div>

            <WeeklyPlan
              weekData={weekData}
              planItems={planItems}
              onOpenSlot={openSlotModal}
            />
          </div>

          <RecipeCards />
        </div>

        <CommunityFeed />
      </div>

      {selectedSlotItems.length > 0 && (
        <SlotRecipesModal
          items={selectedSlotItems}
          title={selectedSlotTitle}
          onClose={closeSlotModal}
          onDelete={handleDeletePlanItem}
          selectedGroceryItemIds={selectedGroceryItemIds}
          onToggleGroceryItem={toggleGroceryItem}
        />
      )}
    </div>
  );
}

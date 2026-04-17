import "./Dashboard.css";
import { Fragment } from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock,
  Droplets,
  Flame,
  Heart,
  Leaf,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Settings,
  Share2,
  ShoppingCart,
  Star,
  Users,
  UtensilsCrossed,
  Wheat,
  ChefHat,
  Bookmark,
} from "lucide-react";

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
  type: "Breakfast" | "Lunch" | "Dinner";
  name?: string;
  time?: string;
  image?: string;
  tags?: string[];
};

type DayPlan = {
  day: string;
  date: string;
  isToday?: boolean;
  meals: MealSlot[];
};

type NavItem = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
};

const navItems: NavItem[] = [
  { icon: <CalendarDays size={18} />, label: "Meal Plan", active: true },
  { icon: <BookOpen size={18} />, label: "Recipes" },
  { icon: <UtensilsCrossed size={18} />, label: "Discover" },
  { icon: <Heart size={18} />, label: "Saved", badge: 12 },
  { icon: <ShoppingCart size={18} />, label: "Grocery List", badge: 3 },
  { icon: <Users size={18} />, label: "Community" },
];

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

const weekData: DayPlan[] = [
  {
    day: "Mon",
    date: "14",
    isToday: true,
    meals: [
      {
        type: "Breakfast",
        name: "Avocado Toast",
        time: "8:00 AM",
        image:
          "https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=120",
        tags: ["Vegan"],
      },
      {
        type: "Lunch",
        name: "Greek Salad",
        time: "12:30 PM",
        image:
          "https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg?auto=compress&cs=tinysrgb&w=120",
        tags: ["Vegetarian"],
      },
      {
        type: "Dinner",
        name: "Grilled Salmon",
        time: "7:00 PM",
        image:
          "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?auto=compress&cs=tinysrgb&w=120",
        tags: ["High Protein"],
      },
    ],
  },
  {
    day: "Tue",
    date: "15",
    meals: [
      {
        type: "Breakfast",
        name: "Oat Porridge",
        time: "7:30 AM",
        image:
          "https://images.pexels.com/photos/4397899/pexels-photo-4397899.jpeg?auto=compress&cs=tinysrgb&w=120",
      },
      { type: "Lunch" },
      {
        type: "Dinner",
        name: "Pasta Primavera",
        time: "6:45 PM",
        image:
          "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=120",
      },
    ],
  },
  {
    day: "Wed",
    date: "16",
    meals: [
      { type: "Breakfast" },
      {
        type: "Lunch",
        name: "Chicken Bowl",
        time: "1:00 PM",
        image:
          "https://images.pexels.com/photos/2116094/pexels-photo-2116094.jpeg?auto=compress&cs=tinysrgb&w=120",
        tags: ["High Protein"],
      },
      { type: "Dinner" },
    ],
  },
  {
    day: "Thu",
    date: "17",
    meals: [
      {
        type: "Breakfast",
        name: "Berry Smoothie",
        time: "8:15 AM",
        image:
          "https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg?auto=compress&cs=tinysrgb&w=120",
      },
      { type: "Lunch" },
      { type: "Dinner" },
    ],
  },
  {
    day: "Fri",
    date: "18",
    meals: [
      { type: "Breakfast" },
      { type: "Lunch" },
      {
        type: "Dinner",
        name: "Beef Tacos",
        time: "7:30 PM",
        image:
          "https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg?auto=compress&cs=tinysrgb&w=120",
      },
    ],
  },
  {
    day: "Sat",
    date: "19",
    meals: [
      {
        type: "Breakfast",
        name: "Pancakes",
        time: "9:00 AM",
        image:
          "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=120",
      },
      { type: "Lunch" },
      { type: "Dinner" },
    ],
  },
  {
    day: "Sun",
    date: "20",
    meals: [{ type: "Breakfast" }, { type: "Lunch" }, { type: "Dinner" }],
  },
];

function Sidebar() {
  return (
    <aside className="plan-sidebar">
      <div className="plan-brand">
        <div className="plan-brand__icon">
          <Leaf size={16} />
        </div>
        <span className="plan-brand__text">Plately</span>
      </div>

      <nav className="plan-nav">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`plan-nav__item ${item.active ? "is-active" : ""}`}
          >
            <span className="plan-nav__icon">{item.icon}</span>
            <span className="plan-nav__label">{item.label}</span>
            {item.badge ? <span className="plan-nav__badge">{item.badge}</span> : null}
          </button>
        ))}
      </nav>

      <div className="plan-sidebar__bottom">
        <div className="plan-pro-card">
          <p className="plan-pro-card__title">Pro Plan</p>
          <p className="plan-pro-card__text">Unlimited recipes & AI suggestions</p>
          <button className="plan-pro-card__button">
            Manage plan <ChevronRight size={12} />
          </button>
        </div>

        <button className="plan-settings-btn">
          <Settings size={18} />
          Settings
        </button>

        <div className="plan-user">
          <img
            src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=60"
            alt="avatar"
            className="plan-user__avatar"
          />
          <div className="plan-user__meta">
            <p className="plan-user__name">Sarah Mitchell</p>
            <p className="plan-user__email">sarah@email.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Header() {
  return (
    <header className="plan-header">
      <div className="plan-header__title-wrap">
        <h1 className="plan-header__title">This Week&apos;s Plan</h1>
        <p className="plan-header__subtitle">Apr 14 – Apr 20, 2026</p>
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
          <div className={`plan-summary-card__icon ${stat.cardClass}`}>{stat.icon}</div>
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

function MealCell({ meal }: { meal: MealSlot }) {
  if (!meal.name) {
    return (
      <div className="plan-meal-empty">
        <Plus size={14} />
      </div>
    );
  }

  return (
    <div className="plan-meal-card">
      {meal.image ? (
        <img src={meal.image} alt={meal.name} className="plan-meal-card__image" />
      ) : null}
      <div className="plan-meal-card__content">
        <p className="plan-meal-card__title">{meal.name}</p>
        {meal.time ? (
          <p className="plan-meal-card__time">
            <Clock size={9} /> {meal.time}
          </p>
        ) : null}
        {meal.tags?.length ? (
          <span className="plan-meal-card__tag">{meal.tags[0]}</span>
        ) : null}
      </div>
    </div>
  );
}

function WeeklyPlan() {
  const mealTypes: Array<"Breakfast" | "Lunch" | "Dinner"> = [
    "Breakfast",
    "Lunch",
    "Dinner",
  ];

  return (
    <div className="plan-weekly-card">
      <div className="plan-weekly-grid">
        <div className="plan-weekly-grid__corner" />

        {weekData.map((day) => (
          <div
            key={day.day}
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

            {weekData.map((day) => (
              <div
                key={`${day.day}-${mealType}`}
                className={`plan-weekly-grid__cell ${
                  mealIdx < 2 ? "plan-weekly-grid__cell--border" : ""
                } ${day.isToday ? "is-today" : ""}`}
              >
                <MealCell meal={day.meals[mealIdx]} />
              </div>
            ))}
          </Fragment>
        ))}
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
  return (
    <div className="plan-page">
      <Sidebar />

      <div className="plan-main-shell">
        <Header />

        <div className="plan-content">
          <div className="plan-main">
            <TodaySummary />

            <div className="plan-section">
              <div className="plan-section__header">
                <div>
                  <h2 className="plan-section__title">Weekly Overview</h2>
                  <p className="plan-section__subtitle">
                    Click any slot to add or swap a meal
                  </p>
                </div>

                <div className="plan-section__actions">
                  <button className="plan-secondary-btn">Auto-fill</button>
                  <button className="plan-primary-outline-btn">Generate plan</button>
                </div>
              </div>

              <WeeklyPlan />
            </div>

            <RecipeCards />
          </div>

          <CommunityFeed />
        </div>
      </div>
    </div>
  );
}
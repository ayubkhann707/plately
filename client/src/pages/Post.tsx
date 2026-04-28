import { Fragment, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/client";

type MealType = "Breakfast" | "Lunch" | "Dinner";

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

function getWeekData(weekStart: Date) {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      label: String(date.getDate()),
      fullDate: formatDateForApi(date),
      isToday: isSameDay(date, today),
    };
  });
}

const mealTypes: MealType[] = ["Breakfast", "Lunch", "Dinner"];

const getEmbedUrl = (url: string) => {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    let videoId = "";
    let start = "";

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1).split("?")[0];
    }

    if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v") || "";

      if (!videoId && parsed.pathname.includes("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0] || "";
      }

      if (!videoId && parsed.pathname.includes("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1]?.split("/")[0] || "";
      }
    }

    const timeParam = parsed.searchParams.get("t");

    if (timeParam) {
      start = timeParam.replace("s", "");
    }

    return videoId
      ? `https://www.youtube.com/embed/${videoId}${
          start ? `?start=${start}` : ""
        }`
      : url;
  } catch {
    return url;
  }
};

export default function Post() {
  const { id } = useParams();

  const [post, setPost] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()));
  const [planItems, setPlanItems] = useState<MealPlanItem[]>([]);

  const weekData = useMemo(() => getWeekData(weekStart), [weekStart]);
  const weekLabel = useMemo(() => formatWeekLabel(weekStart), [weekStart]);

  useEffect(() => {
    async function loadPost() {
      const res = await api.get(`/posts/${id}`);
      setPost(res.data);
      setSaved(Boolean(res.data?.saved));
    }

    loadPost();
  }, [id]);

  async function openPlanModal() {
    try {
      const res = await api.get("/plan");
      setPlanItems(res.data);
      setShowPlanModal(true);
    } catch (err) {
      alert("Error loading plan");
    }
  }

  function getItemsForSlot(date: string, mealType: MealType) {
    return planItems.filter((item) => {
      return item.date.slice(0, 10) === date && item.mealType === mealType;
    });
  }

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

  async function handleSave() {
    try {
      await api.post(`/posts/${id}/save`);
      setSaved(true);
      alert("Saved!");
    } catch (err) {
      alert("Error saving post");
    }
  }

  async function handleUnsave() {
    try {
      await api.delete(`/posts/${id}/save`);
      setSaved(false);
      alert("Unsaved!");
    } catch (err) {
      alert("Error unsaving post");
    }
  }

  async function handleAddToPlan(date: string, mealType: MealType) {
    if (!post?.recipe?.id) {
      alert("This post has no recipe to add");
      return;
    }

    const alreadyAdded = planItems.some((item) => {
      return (
        item.date.slice(0, 10) === date &&
        item.mealType === mealType &&
        item.recipe?.post?.id === post.id
      );
    });

    if (alreadyAdded) {
      alert("This recipe is already added to this slot");
      return;
    }

    try {
      const res = await api.post("/plan", {
        recipeId: post.recipe.id,
        date,
        mealType,
      });

      setPlanItems((current) => [...current, res.data]);
      alert("Added to plan");
    } catch (err) {
      alert("Error adding to plan");
    }
  }

  if (!post) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        Loading recipes...
      </div>
    );
  }

  const embedUrl = getEmbedUrl(post.videoUrl);
  const isYouTube = embedUrl.includes("youtube.com/embed");
  const hasVideo = Boolean(post.videoUrl);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <h1 style={{ margin: 0 }}>{post.title}</h1>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={openPlanModal}
            style={{
              background: "#2196F3",
              color: "white",
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Add to Plan
          </button>

          <button
            onClick={saved ? handleUnsave : handleSave}
            style={{
              background: saved ? "#ccc" : "#4CAF50",
              color: "white",
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {saved ? "Saved ✓" : "Save"}
          </button>
        </div>
      </div>

      {showPlanModal && (
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
              width: "min(1050px, 95vw)",
              boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>Choose a slot</h2>
                <p style={{ margin: "6px 0 0", color: "#94a3b8" }}>
                  {weekLabel}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  onClick={goToPreviousWeek}
                  style={{
                    border: "1px solid #e5e7eb",
                    background: "white",
                    borderRadius: "14px",
                    padding: "10px 12px",
                    cursor: "pointer",
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  onClick={goToCurrentWeek}
                  style={{
                    border: "1px solid #e5e7eb",
                    background: "white",
                    borderRadius: "14px",
                    padding: "10px 16px",
                    cursor: "pointer",
                  }}
                >
                  Today
                </button>

                <button
                  onClick={goToNextWeek}
                  style={{
                    border: "1px solid #e5e7eb",
                    background: "white",
                    borderRadius: "14px",
                    padding: "10px 12px",
                    cursor: "pointer",
                  }}
                >
                  <ChevronRight size={16} />
                </button>

                <button
                  onClick={() => setShowPlanModal(false)}
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
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "130px repeat(7, 1fr)",
                border: "1px solid #e5e7eb",
                borderRadius: "24px",
                overflow: "hidden",
              }}
            >
              <div style={{ background: "#fff" }} />

              {weekData.map((day) => (
                <div
                  key={day.fullDate}
                  style={{
                    padding: "20px 12px",
                    textAlign: "center",
                    background: day.isToday ? "#ecfdf3" : "#fff",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: day.isToday ? "#16a34a" : "#9ca3af",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {day.day}
                  </p>

                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: "24px",
                      fontWeight: 800,
                      color: "#111827",
                    }}
                  >
                    {day.label}
                  </p>

                  {day.isToday && (
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        background: "#22c55e",
                        borderRadius: "999px",
                        margin: "8px auto 0",
                      }}
                    />
                  )}
                </div>
              ))}

              {mealTypes.map((mealType, mealIdx) => (
                <Fragment key={mealType}>
                  <div
                    style={{
                      minHeight: "120px",
                      borderTop: mealIdx === 0 ? "none" : "1px solid #e5e7eb",
                      borderRight: "1px solid #e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9ca3af",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                    }}
                  >
                    {mealType}
                  </div>

                  {weekData.map((day) => {
                    const items = getItemsForSlot(day.fullDate, mealType);

                    return (
                      <div
                        key={`${day.fullDate}-${mealType}`}
                        style={{
                          minHeight: "120px",
                          padding: "12px",
                          background: day.isToday ? "#f0fdf4" : "#fff",
                          borderTop: mealIdx === 0 ? "none" : "1px solid #e5e7eb",
                        }}
                      >
                        <button
                          onClick={() => handleAddToPlan(day.fullDate, mealType)}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "22px",
                            border: items.length
                              ? "2px solid #bbf7d0"
                              : "2px dashed #e5e7eb",
                            background: items.length ? "#f0fdf4" : "white",
                            color: items.length ? "#16a34a" : "#cbd5e1",
                            fontSize: items.length ? "14px" : "28px",
                            cursor: "pointer",
                            padding: "10px",
                            fontWeight: 700,
                          }}
                        >
                          {items.length ? `${items.length} planned` : "+"}
                        </button>
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "8px",
          marginBottom: "16px",
        }}
      >
        {post.tags?.map((tag: string) => (
          <span
            key={tag}
            style={{
              background: "#eee",
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "0.9rem",
              color: "#555",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <div
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          marginBottom: "16px",
          background: "#f3f4f6",
        }}
      >
        {isYouTube ? (
          <div
            style={{
              position: "relative",
              paddingTop: "56.25%",
              background: "#000",
            }}
          >
            <iframe
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              src={embedUrl}
              title="Recipe video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title}
            style={{
              width: "100%",
              maxHeight: "520px",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : hasVideo ? (
          <div
            style={{
              height: "320px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#111827",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <p>This video format cannot be embedded directly.</p>

            <a
              href={post.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#4CAF50",
                textDecoration: "underline",
                marginTop: "10px",
                fontWeight: "bold",
              }}
            >
              Watch video on original platform
            </a>
          </div>
        ) : (
          <div
            style={{
              height: "320px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
            }}
          >
            No image
          </div>
        )}
      </div>

      {!post.recipe ? (
        <p>No recipe details available for this post.</p>
      ) : (
        <>
          <h2 style={{ marginTop: "16px", marginBottom: "12px" }}>Recipe</h2>

          <div style={{ display: "flex", gap: 12, marginBottom: "20px" }}>
            <div
              style={{
                background: "#f5f5f5",
                padding: "8px 16px",
                borderRadius: "8px",
              }}
            >
              ⏱ {post.recipe.timeMinutes} min
            </div>

            <div
              style={{
                background: "#f5f5f5",
                padding: "8px 16px",
                borderRadius: "8px",
              }}
            >
              🍽 {post.recipe.servings} servings
            </div>
          </div>

          <h4 style={{ marginBottom: "8px" }}>Ingredients</h4>

          <ul style={{ paddingLeft: 0, listStyleType: "none" }}>
            {post.recipe.ingredients.map((i: any) => (
              <li
                key={i.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span>{i.name}</span>
                <span>
                  {i.quantity} {i.unit}
                </span>
              </li>
            ))}
          </ul>

          <h4 style={{ marginTop: "20px", marginBottom: "8px" }}>Steps</h4>

          <ol style={{ paddingLeft: "20px" }}>
            {post.recipe.steps.map((s: any) => (
              <li key={s.order} style={{ marginBottom: "8px" }}>
                {s.text}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

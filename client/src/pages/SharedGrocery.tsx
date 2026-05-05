import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

type GroceryItem = {
  name: string;
  quantity: number;
  unit: string | null;
  convertedQuantity?: number;
  convertedUnit?: string | null;
  category: string;
  inPantry?: boolean;
};

type RecipeGroup = {
  planItemId: string;
  recipeId: string | number;
  recipeTitle: string;
  recipeImageUrl?: string | null;
  imageUrl?: string | null;
  items: GroceryItem[];
};

type SharedPayload =
  | GroceryItem[]
  | {
      byCategory?: GroceryItem[];
      items?: GroceryItem[];
      byRecipe?: RecipeGroup[];
      checkedItems?: string[];
      createdAt?: string;
    };

type Tab = "byCategory" | "byRecipe";

const CATEGORY_EMOJI: Record<string, string> = {
  Produce: "🥦",
  "Meat & Seafood": "🥩",
  "Dairy & Eggs": "🧀",
  Bakery: "🥖",
  "Grains & Pasta": "🍝",
  "Canned & Jarred": "🥫",
  "Condiments & Sauces": "🧂",
  "Spices & Herbs": "🌿",
  Baking: "🍰",
  "Oils & Vinegars": "🫒",
  Frozen: "❄️",
  Snacks: "🍿",
  Beverages: "🥤",
  Other: "🛒",

  // Backward compatibility for older shared links
  Protein: "🥩",
  Dairy: "🧀",
  Pantry: "🥫",
  Spices: "🌿",
};

function itemKey(item: GroceryItem, prefix = "") {
  return `${prefix}${item.name}-${item.unit || "null"}`;
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "0";
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function formatQuantity(item: GroceryItem) {
  const original =
    item.quantity > 0
      ? `${formatNumber(item.quantity)} ${item.unit || ""}`.trim()
      : "–";

  if (
    item.convertedQuantity != null &&
    item.convertedQuantity > 0 &&
    item.convertedUnit &&
    item.unit &&
    item.convertedUnit !== item.unit
  ) {
    return `${original} (${Math.round(item.convertedQuantity)} ${item.convertedUnit})`;
  }

  return original;
}

function btn(bg: string, color: string, border: string): CSSProperties {
  return {
    border: `1px solid ${border}`,
    background: bg,
    color,
    borderRadius: "12px",
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
  };
}

export default function SharedGrocery() {
  const { token } = useParams<{ token: string }>();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [byRecipe, setByRecipe] = useState<RecipeGroup[]>([]);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("byCategory");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    api
      .get(`/grocery/share/${token}`)
      .then((res) => {
        const sharedData: SharedPayload = res.data;

        if (Array.isArray(sharedData)) {
          setItems(sharedData);
          setByRecipe([]);
          setCheckedItems(new Set());
          setCreatedAt(null);
        } else {
          setItems(sharedData.byCategory || sharedData.items || []);
          setByRecipe(sharedData.byRecipe || []);
          setCheckedItems(new Set(sharedData.checkedItems || []));
          setCreatedAt(sharedData.createdAt || null);
        }
      })
      .catch(() => setError("Grocery list not found or has expired."))
      .finally(() => setLoading(false));
  }, [token]);

  function toggleChecked(key: string) {
    setCheckedItems((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function isChecked(item: GroceryItem, prefix = "") {
    return checkedItems.has(itemKey(item, prefix));
  }

  function sortCheckedToBottom(list: GroceryItem[], prefix = "") {
    return [...list].sort(
      (a, b) => Number(isChecked(a, prefix)) - Number(isChecked(b, prefix))
    );
  }

  const grouped = useMemo(() => {
    const map: Record<string, GroceryItem[]> = {};

    for (const item of items) {
      const cat = item.category || "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    }

    for (const cat of Object.keys(map)) {
      map[cat] = sortCheckedToBottom(map[cat]);
    }

    return map;
  }, [items, checkedItems]);

  const totalItems = items.length;

  if (loading) {
    return <p style={{ padding: "24px", color: "#64748b" }}>Loading…</p>;
  }

  if (error) {
    return <p style={{ padding: "24px", color: "#dc2626" }}>{error}</p>;
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "24px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>Shared Grocery List</h1>
        <p style={{ color: "#64748b", marginTop: "6px", marginBottom: "14px" }}>
          {createdAt && `Created ${new Date(createdAt).toLocaleDateString()} · `}
          {totalItems} item{totalItems !== 1 ? "s" : ""}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            background: "#f1f5f9",
            padding: "6px",
            borderRadius: "16px",
            width: "fit-content",
          }}
        >
          {(["byCategory", "byRecipe"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                border: "none",
                borderRadius: "12px",
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: 700,
                background: activeTab === tab ? "white" : "transparent",
                color: activeTab === tab ? "#111827" : "#64748b",
              }}
            >
              {tab === "byCategory" ? "By category" : "By recipes"}
            </button>
          ))}
        </div>

        {checkedItems.size > 0 && (
          <button onClick={() => setCheckedItems(new Set())} style={btn("#fff", "#64748b", "#e2e8f0")}>
            Uncheck All
          </button>
        )}
      </div>

      {activeTab === "byCategory" && totalItems > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div
              key={cat}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 18px",
                  background: "#f8fafc",
                  borderBottom: "1px solid #e5e7eb",
                  fontWeight: 700,
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <span>{CATEGORY_EMOJI[cat] || "•"}</span>
                <span>{cat}</span>
                <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "13px" }}>
                  {catItems.length} item{catItems.length !== 1 ? "s" : ""}
                </span>
              </div>

              {catItems.map((item) => {
                const key = itemKey(item);
                const checked = checkedItems.has(key);

                return (
                  <label
                    key={key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 18px",
                      borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer",
                      textDecoration: checked ? "line-through" : "none",
                      color: checked ? "#94a3b8" : "#111827",
                      background: checked ? "#f8fafc" : "white",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleChecked(key)}
                        style={{ marginRight: "10px" }}
                      />
                      {item.name}
                    </span>
                    <span style={{ color: "#64748b", whiteSpace: "nowrap" }}>{formatQuantity(item)}</span>
                  </label>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {activeTab === "byRecipe" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {byRecipe.length === 0 && (
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "24px",
                color: "#64748b",
              }}
            >
              This shared link was created before recipe grouping was saved. Use By category for this list.
            </div>
          )}

          {byRecipe.map((group) => {
            const imageUrl = group.recipeImageUrl || group.imageUrl;
            const sortedItems = sortCheckedToBottom(group.items, `${group.planItemId}-`);

            return (
              <div
                key={group.planItemId}
                style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "18px",
                    background: "#f8fafc",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    gap: "14px",
                    alignItems: "center",
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={group.recipeTitle}
                      style={{
                        width: "70px",
                        height: "70px",
                        objectFit: "cover",
                        borderRadius: "16px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "16px",
                        background: "#e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      🍽️
                    </div>
                  )}

                  <div>
                    <h3 style={{ margin: 0, color: "#111827" }}>{group.recipeTitle}</h3>
                    <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                      {group.items.length} item{group.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {sortedItems.map((item) => {
                  const key = itemKey(item, `${group.planItemId}-`);
                  const checked = checkedItems.has(key);

                  return (
                    <label
                      key={key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px 18px",
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                        textDecoration: checked ? "line-through" : "none",
                        color: checked ? "#94a3b8" : "#111827",
                        background: checked ? "#f8fafc" : "white",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleChecked(key)}
                          style={{ marginRight: "10px" }}
                        />
                        {CATEGORY_EMOJI[item.category] || ""} {item.name}
                      </span>
                      <span style={{ color: "#64748b", whiteSpace: "nowrap" }}>{formatQuantity(item)}</span>
                    </label>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {totalItems === 0 && byRecipe.length === 0 && (
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "24px",
            color: "#64748b",
          }}
        >
          No items in this shared grocery list.
        </div>
      )}

      <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "24px" }}>Made with Plately</p>
    </div>
  );
}

import { useEffect, useMemo, useState, type CSSProperties } from "react";
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
  Protein: "🥩",
  Dairy: "🧀",
  Pantry: "🥫",
  Spices: "🌿",
};

function getStorageSuffix() {
  return localStorage.getItem("token") || "anon";
}

function storageKey(key: string) {
  return `${key}:${getStorageSuffix()}`;
}

const CHECKED_KEY = storageKey("grocery_checked");
const MANUAL_KEY = storageKey("grocery_manual");

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}


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

export default function Grocery() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [byRecipe, setByRecipe] = useState<RecipeGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    const saved = safeParse<string[]>(localStorage.getItem(CHECKED_KEY), []);
    return new Set(saved);
  });

  const [manualItems, setManualItems] = useState<GroceryItem[]>(() =>
    safeParse<GroceryItem[]>(localStorage.getItem(MANUAL_KEY), [])
  );

  const [activeTab, setActiveTab] = useState<Tab>("byCategory");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [manualInput, setManualInput] = useState("");

  async function loadGroceryList() {
    setLoading(true);

    try {
      const params = new URLSearchParams(window.location.search);
      const planItemIds = params.get("planItemIds");
      const fromParam = params.get("from");
      const toParam = params.get("to");

      if (!planItemIds && !fromParam && !toParam) {
        setItems([]);
        setByRecipe([]);
        return;
      }

      let url = "";

      if (planItemIds) {
        url = `/grocery?planItemIds=${encodeURIComponent(planItemIds)}`;
      } else {
        url = `/grocery?from=${encodeURIComponent(fromParam || "")}&to=${encodeURIComponent(
          toParam || ""
        )}`;
      }

      const res = await api.get(url);

      if (Array.isArray(res.data)) {
        setItems(res.data);
        setByRecipe([]);

      } else {
        const nextItems = res.data.byCategory || [];
        const nextByRecipe = res.data.byRecipe || [];

        setItems(nextItems);
        setByRecipe(nextByRecipe);
        
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load grocery list");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroceryList();
  }, []);

  useEffect(() => {
    localStorage.setItem(CHECKED_KEY, JSON.stringify(Array.from(checkedItems)));
  }, [checkedItems]);

  useEffect(() => {
    localStorage.setItem(MANUAL_KEY, JSON.stringify(manualItems));
  }, [manualItems]);


  const allItems = useMemo(() => {
    return [...items, ...manualItems];
  }, [items, manualItems]);

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

    for (const item of allItems) {
      const cat = item.category || "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    }

    for (const cat of Object.keys(map)) {
      map[cat] = sortCheckedToBottom(map[cat]);
    }

    return map;
  }, [allItems, checkedItems]);

  const extraRecipeGroup = useMemo<RecipeGroup | null>(() => {
    if (manualItems.length === 0) return null;

    return {
      planItemId: "extra-items",
      recipeId: "extra-items",
      recipeTitle: "Extra Items",
      recipeImageUrl: null,
      imageUrl: null,
      items: manualItems,
    };
  }, [manualItems]);

  const byRecipeWithExtras = useMemo(() => {
    return extraRecipeGroup ? [...byRecipe, extraRecipeGroup] : byRecipe;
  }, [byRecipe, extraRecipeGroup]);

  function toggleChecked(key: string) {
    setCheckedItems((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleShare() {
    setShareLoading(true);
    setCopyStatus("");

    try {
      const res = await api.post("/grocery/share", {
        byCategory: allItems,
        byRecipe: byRecipeWithExtras,
      });

      setShareUrl(res.data.url);
    } catch (err) {
      console.error(err);
      alert("Failed to create share link");
    } finally {
      setShareLoading(false);
    }
  }

  async function handleCopyShareLink() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("Copied!");
      window.setTimeout(() => setCopyStatus(""), 1800);
    } catch (err) {
      console.error(err);
      setCopyStatus("Could not copy");
    }
  }

  function addManualItem() {
    if (!manualInput.trim()) return;

    const newItem: GroceryItem = {
      name: manualInput.trim(),
      quantity: 0,
      unit: null,
      category: "Other",
      inPantry: false,
    };

    setManualItems((prev) => [...prev, newItem]);
    setManualInput("");
  }

  function removeManualItem(name: string) {
    setManualItems((prev) => prev.filter((i) => i.name !== name));

    setCheckedItems((cur) => {
      const next = new Set(cur);
      next.delete(`${name}-null`);
      next.delete(`extra-items-${name}-null`);
      return next;
    });
  }

  function combineRecipeGroups(groups: RecipeGroup[]) {
    const map: Record<string, GroceryItem> = {};

    for (const group of groups) {
      for (const item of group.items) {
        const key = `${item.name.trim().toLowerCase()}-${item.unit || "null"}`;

        if (!map[key]) {
          map[key] = {
            name: item.name,
            quantity: item.convertedQuantity ?? item.quantity ?? 0,
            unit: item.convertedUnit || item.unit,
            category: item.category || "Other",
            inPantry: item.inPantry || false,
          };
        } else {
          const quantityToAdd = item.convertedQuantity ?? item.quantity ?? 0;
          map[key].quantity = Number((map[key].quantity + quantityToAdd).toFixed(2));
        }
      }
    }

    return Object.values(map);
  }

  function removeRecipeGroup(planItemId: string) {
    if (planItemId === "extra-items") {
      setManualItems([]);
      setCheckedItems((current) => {
        const next = new Set(current);

        for (const item of manualItems) {
          next.delete(itemKey(item));
          next.delete(itemKey(item, "extra-items-"));
        }

        return next;
      });
      return;
    }

    setByRecipe((prev) => {
      const removedGroup = prev.find((group) => group.planItemId === planItemId);
      const remainingGroups = prev.filter((group) => group.planItemId !== planItemId);

      if (remainingGroups.length === 0) {
        setItems([]);
        localStorage.removeItem("grocery_last_url");
        window.history.pushState(null, "", "/grocery");
      } else {
        setItems(combineRecipeGroups(remainingGroups));

        const groceryUrl = `/grocery?planItemIds=${encodeURIComponent(
          remainingGroups.map((group) => group.planItemId).join(",")
        )}`;

        localStorage.setItem("grocery_last_url", groceryUrl);
        window.history.pushState(null, "", groceryUrl);
      }

      if (removedGroup) {
        setCheckedItems((current) => {
          const next = new Set(current);

          for (const item of removedGroup.items) {
            next.delete(itemKey(item, `${planItemId}-`));
          }

          return next;
        });
      }

      return remainingGroups;
    });
  }

  function uncheckAll() {
    setCheckedItems(new Set());
  }

  function clearCheckedManual() {
    setManualItems((prev) => prev.filter((i) => !checkedItems.has(itemKey(i))));
  }

  const shoppingItems = allItems;

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "24px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>Grocery List</h1>
        <p style={{ color: "#64748b", marginTop: "6px", marginBottom: "14px" }}>
          {shoppingItems.length > 0
            ? `Loaded from your selected recipes · ${shoppingItems.length} items`
            : "Please choose recipes from your weekly plan and add them to the grocery list."}
        </p>

        <div className="no-print" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={handleShare}
            disabled={shareLoading || allItems.length === 0}
            style={btn("#faf5ff", "#7c3aed", "#e9d5ff")}
          >
            {shareLoading ? "…" : "🔗 Share link"}
          </button>
        </div>

        {shareUrl && (
          <div
            style={{
              marginTop: "10px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "12px",
              padding: "10px 14px",
              display: "flex",
              gap: "8px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <strong>Share link:</strong>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" style={{ wordBreak: "break-all" }}>
              {shareUrl}
            </a>
            <button
              onClick={handleCopyShareLink}
              style={{ ...btn("#fff", "#16a34a", "#bbf7d0"), padding: "4px 10px" }}
            >
              Copy
            </button>
            {copyStatus && <span style={{ color: "#16a34a", fontWeight: 700 }}>{copyStatus}</span>}
          </div>
        )}
      </div>

      <div
        className="no-print"
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ margin: "0 0 8px" }}>➕ Add Extra Items</h3>
        <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 12px" }}>
          Need something else? Add it manually here.
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addManualItem()}
            placeholder="e.g. Milk, Eggs, Bread..."
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
            }}
          />
          <button onClick={addManualItem} style={btn("#f0fdf4", "#16a34a", "#bbf7d0")}>
            Add Item
          </button>
        </div>
      </div>

      <div
        className="no-print"
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

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {checkedItems.size > 0 && (
            <button onClick={uncheckAll} style={btn("#fff", "#64748b", "#e2e8f0")}>
              Uncheck All
            </button>
          )}
          {manualItems.some((i) => checkedItems.has(itemKey(i))) && (
            <button onClick={clearCheckedManual} style={btn("#fff", "#ef4444", "#fecaca")}>
              Clear Checked Extra
            </button>
          )}
        </div>
      </div>

      {loading && <p style={{ color: "#64748b" }}>Loading grocery list…</p>}

      {!loading && allItems.length === 0 && byRecipeWithExtras.length === 0 && (
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "24px",
            color: "#64748b",
          }}
        >
          Please choose recipes from your weekly plan and add them to the grocery list.
        </div>
      )}

      {!loading && activeTab === "byCategory" && allItems.length > 0 && (
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

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ color: "#64748b", whiteSpace: "nowrap" }}>{formatQuantity(item)}</span>

                      {manualItems.some((mi) => mi.name === item.name) && (
                        <button
                          className="no-print"
                          onClick={(e) => {
                            e.preventDefault();
                            removeManualItem(item.name);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            padding: "4px",
                            fontSize: "18px",
                          }}
                          title="Remove manual item"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {!loading && activeTab === "byRecipe" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {byRecipeWithExtras.length === 0 && (
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "24px",
                color: "#64748b",
              }}
            >
              No recipe groups to show.
            </div>
          )}

          {byRecipeWithExtras.map((group) => {
            const imageUrl = group.recipeImageUrl || group.imageUrl;
            const sortedItems = sortCheckedToBottom(group.items, `${group.planItemId}-`);
            const isExtraGroup = group.planItemId === "extra-items";

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
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={group.recipeTitle}
                      style={{
                        width: "72px",
                        height: "72px",
                        objectFit: "cover",
                        borderRadius: "16px",
                        background: "#e2e8f0",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "16px",
                        background: isExtraGroup ? "#f0fdf4" : "#e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "28px",
                      }}
                    >
                      {isExtraGroup ? "➕" : "🍽️"}
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: "18px", color: "#111827" }}>
                      {group.recipeTitle}
                    </h3>
                    <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                      {group.items.length} item{group.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <button onClick={() => removeRecipeGroup(group.planItemId)} style={btn("#fef2f2", "#dc2626", "#fecaca")}>
                    Delete
                  </button>
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
                        <span style={{ marginRight: "8px" }}>{CATEGORY_EMOJI[item.category] || ""}</span>
                        {item.name}
                      </span>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ color: "#64748b", whiteSpace: "nowrap" }}>{formatQuantity(item)}</span>

                        {isExtraGroup && (
                          <button
                            className="no-print"
                            onClick={(e) => {
                              e.preventDefault();
                              removeManualItem(item.name);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: "4px",
                              fontSize: "18px",
                            }}
                            title="Remove extra item"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
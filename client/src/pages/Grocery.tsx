import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

type GroceryItem = {
  name: string;
  quantity: number;
  unit: string | null;
  category: string;
  inPantry: boolean;
};

type PantryItem = {
  id: string;
  name: string;
};

type Tab = "combined" | "byCategory";

const CATEGORY_EMOJI: Record<string, string> = {
  Produce: "🥦",
  Protein: "🥩",
  Dairy: "🧀",
  Pantry: "🥫",
  Spices: "🌿",
  Other: "🛒",
};

export default function Grocery() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>("byCategory");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [pantryInput, setPantryInput] = useState("");
  const [showPantry, setShowPantry] = useState(false);

  async function loadGroceryList() {
    setLoading(true);
    try {
      const now = new Date();
      const monday = new Date(now);
      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      monday.setDate(now.getDate() + diff);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const res = await api.get(`/grocery?from=${fmt(monday)}&to=${fmt(sunday)}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadPantry() {
    try {
      const res = await api.get("/pantry");
      setPantry(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadGroceryList();
    loadPantry();
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, GroceryItem[]> = {};
    for (const item of items) {
      const cat = item.category || "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    }
    return map;
  }, [items]);

  function toggleChecked(key: string) {
    setCheckedItems((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function itemKey(item: GroceryItem) {
    return `${item.name}-${item.unit}`;
  }

  async function handleShare() {
    setShareLoading(true);
    try {
      const res = await api.post("/grocery/share", { items });
      setShareUrl(res.data.url);
    } catch (err) {
      console.error(err);
    } finally {
      setShareLoading(false);
    }
  }

  function formatAsText() {
    return Object.entries(grouped)
      .map(([cat, catItems]) => {
        const header = `${CATEGORY_EMOJI[cat] || "•"} ${cat}`;
        const lines = catItems
          .filter((i) => !i.inPantry)
          .map((i) => `  - ${i.name}${i.quantity ? ` — ${i.quantity}${i.unit ? " " + i.unit : ""}` : ""}`)
          .join("\n");
        return lines ? `${header}\n${lines}` : null;
      })
      .filter(Boolean)
      .join("\n\n");
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent("🛒 My Grocery List\n\n" + formatAsText())}`, "_blank");
  }

  function handleEmail() {
    window.location.href = `mailto:?subject=Grocery%20List&body=${encodeURIComponent(formatAsText())}`;
  }

  function handleCopy() {
    navigator.clipboard.writeText(formatAsText());
  }

  async function addToPantry() {
    if (!pantryInput.trim()) return;
    try {
      const res = await api.post("/pantry", { name: pantryInput.trim() });
      setPantry((p) => [...p, res.data]);
      setPantryInput("");
    } catch (err) {
      console.error(err);
    }
  }

  async function removeFromPantry(id: string) {
    try {
      await api.delete(`/pantry/${id}`);
      setPantry((p) => p.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const shoppingItems = items.filter((i) => !i.inPantry);
  const pantryItems = items.filter((i) => i.inPantry);

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "24px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>Grocery List</h1>
        <p style={{ color: "#64748b", marginTop: "6px", marginBottom: "14px" }}>
          Auto-loaded from this week · {shoppingItems.length} items to buy
          {pantryItems.length > 0 && ` · ${pantryItems.length} already in pantry`}
        </p>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={handleCopy} style={btn("#f0fdf4","#16a34a","#bbf7d0")}>📋 Copy</button>
          <button onClick={handleWhatsApp} style={btn("#f0fdf4","#15803d","#bbf7d0")}>📱 WhatsApp</button>
          <button onClick={handleEmail} style={btn("#eff6ff","#1d4ed8","#bfdbfe")}>✉️ Email</button>
          <button onClick={handleShare} disabled={shareLoading || items.length === 0} style={btn("#faf5ff","#7c3aed","#e9d5ff")}>
            {shareLoading ? "…" : "🔗 Share link"}
          </button>
          <button onClick={() => setShowPantry((s) => !s)} style={btn("#fff7ed","#c2410c","#fed7aa")}>
            🧺 Pantry ({pantry.length})
          </button>
          <button onClick={loadGroceryList} style={btn("#f8fafc","#475569","#e2e8f0")}>↺ Refresh</button>
        </div>

        {shareUrl && (
          <div style={{ marginTop: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "10px 14px" }}>
            <strong>Share link: </strong>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer">{shareUrl}</a>
            <button onClick={() => navigator.clipboard.writeText(shareUrl)} style={{ marginLeft: "8px", ...btn("#fff","#16a34a","#bbf7d0"), padding: "4px 10px" }}>Copy</button>
          </div>
        )}
      </div>

      {showPantry && (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "16px", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 8px" }}>🧺 My Pantry</h3>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 12px" }}>Items you already have — they'll be greyed out in your list.</p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              value={pantryInput}
              onChange={(e) => setPantryInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addToPantry()}
              placeholder="e.g. olive oil, garlic..."
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "10px" }}
            />
            <button onClick={addToPantry} style={btn("#f0fdf4","#16a34a","#bbf7d0")}>Add</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {pantry.map((p) => (
              <span key={p.id} style={{ background: "#f1f5f9", borderRadius: "20px", padding: "4px 12px", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                {p.name}
                <button onClick={() => removeFromPantry(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "16px", padding: 0 }}>×</button>
              </span>
            ))}
            {pantry.length === 0 && <span style={{ color: "#94a3b8" }}>No pantry items yet.</span>}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", background: "#f1f5f9", padding: "6px", borderRadius: "16px", marginBottom: "20px", width: "fit-content" }}>
        {(["byCategory", "combined"] as Tab[]).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            border: "none", borderRadius: "12px", padding: "8px 16px", cursor: "pointer", fontWeight: 700,
            background: activeTab === tab ? "white" : "transparent",
            color: activeTab === tab ? "#111827" : "#64748b",
          }}>
            {tab === "byCategory" ? "By category" : "All items"}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: "#64748b" }}>Loading grocery list…</p>}

      {!loading && items.length === 0 && (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "24px", color: "#64748b" }}>
          No meals planned this week. Add recipes to your meal calendar first.
        </div>
      )}

      {!loading && activeTab === "byCategory" && items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {Object.entries(grouped).map(([cat, catItems]) => {
            const toBuy = catItems.filter((i) => !i.inPantry);
            const have = catItems.filter((i) => i.inPantry);
            return (
              <div key={cat} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "16px", overflow: "hidden" }}>
                <div style={{ padding: "12px 18px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb", fontWeight: 700, display: "flex", gap: "8px", alignItems: "center" }}>
                  <span>{CATEGORY_EMOJI[cat] || "•"}</span>
                  <span>{cat}</span>
                  <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "13px" }}>{toBuy.length} item{toBuy.length !== 1 ? "s" : ""}</span>
                </div>
                {toBuy.map((item) => {
                  const key = itemKey(item);
                  const checked = checkedItems.has(key);
                  return (
                    <label key={key} style={{
                      display: "flex", justifyContent: "space-between", padding: "12px 18px",
                      borderBottom: "1px solid #f1f5f9", cursor: "pointer",
                      textDecoration: checked ? "line-through" : "none",
                      color: checked ? "#94a3b8" : "#111827",
                      background: checked ? "#f8fafc" : "white",
                    }}>
                      <span>
                        <input type="checkbox" checked={checked} onChange={() => toggleChecked(key)} style={{ marginRight: "10px" }} />
                        {item.name}
                      </span>
                      <span style={{ color: "#64748b" }}>{item.quantity > 0 ? item.quantity : "–"} {item.unit || ""}</span>
                    </label>
                  );
                })}
                {have.length > 0 && (
                  <div style={{ padding: "8px 18px", background: "#f0fdf4", borderTop: "1px solid #f1f5f9" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>✓ Already in pantry</p>
                    {have.map((item) => (
                      <span key={itemKey(item)} style={{ fontSize: "13px", color: "#64748b", marginRight: "12px" }}>{item.name}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && activeTab === "combined" && items.length > 0 && (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "16px", overflow: "hidden" }}>
          {items.map((item) => {
            const key = itemKey(item);
            const checked = checkedItems.has(key);
            return (
              <label key={key} style={{
                display: "flex", justifyContent: "space-between", padding: "12px 18px",
                borderBottom: "1px solid #f1f5f9", cursor: "pointer",
                textDecoration: checked || item.inPantry ? "line-through" : "none",
                color: checked || item.inPantry ? "#94a3b8" : "#111827",
                background: item.inPantry ? "#f0fdf4" : checked ? "#f8fafc" : "white",
              }}>
                <span>
                  <input type="checkbox" checked={checked} onChange={() => toggleChecked(key)} style={{ marginRight: "10px" }} />
                  {CATEGORY_EMOJI[item.category] || ""} {item.name}
                  {item.inPantry && <span style={{ fontSize: "12px", color: "#16a34a", marginLeft: "8px" }}>✓ pantry</span>}
                </span>
                <span style={{ color: "#64748b" }}>{item.quantity > 0 ? item.quantity : "–"} {item.unit || ""}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function btn(bg: string, color: string, border: string): React.CSSProperties {
  return { border: `1px solid ${border}`, background: bg, color, borderRadius: "12px", padding: "8px 14px", cursor: "pointer", fontWeight: 600, fontSize: "14px" };
}

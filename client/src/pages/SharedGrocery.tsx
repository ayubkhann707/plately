import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";

type GroceryItem = {
  name: string;
  quantity: number;
  unit: string | null;
  category: string;
  inPantry: boolean;
};

const CATEGORY_EMOJI: Record<string, string> = {
  Produce: "🥦", Protein: "🥩", Dairy: "🧀", Pantry: "🥫", Spices: "🌿", Other: "🛒",
};

export default function SharedGrocery() {
  const { token } = useParams<{ token: string }>();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/grocery/share/${token}`)
      .then((res) => {
        setItems(res.data.items);
        setCreatedAt(res.data.createdAt);
      })
      .catch(() => setError("Grocery list not found or has expired."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading…</div>;
  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "#dc2626" }}>{error}</div>;

  const grouped = items.reduce<Record<string, GroceryItem[]>>((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ margin: 0 }}>🛒 Shared Grocery List</h1>
      {createdAt && (
        <p style={{ color: "#94a3b8", marginTop: "6px" }}>
          Created {new Date(createdAt).toLocaleDateString()} · {items.length} items
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
        {Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb", fontWeight: 700 }}>
              {CATEGORY_EMOJI[cat] || "•"} {cat}
            </div>
            {catItems.map((item) => (
              <div key={`${item.name}-${item.unit}`} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #f1f5f9" }}>
                <span>{item.name}</span>
                <span style={{ color: "#64748b" }}>{item.quantity > 0 ? item.quantity : "–"} {item.unit || ""}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <p style={{ marginTop: "24px", color: "#94a3b8", fontSize: "13px", textAlign: "center" }}>
        Made with Plately 🍽️
      </p>
    </div>
  );
}

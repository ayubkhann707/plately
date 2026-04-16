import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function Plan() {
  const [items, setItems] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const res = await api.get("/plan");
      setItems(res.data);
    }

    load();
  }, []);

  async function handleDelete(id: string) {
    await api.delete(`/plan/${id}`);
    setItems(items.filter((i) => i.id !== id));
    alert("Removed from plan");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Meal Plan</h1>
        <button onClick={() => navigate("/grocery")}>
          View Grocery List →
        </button>
      </div>

      {items.length === 0 && <p>Your meal plan is empty.</p>}

      {items.map((item) => (
        <div key={item.id} style={{ 
          marginBottom: 10, 
          padding: 10, 
          border: "1px solid #eee",
          borderRadius: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <p style={{ fontWeight: "bold", margin: 0 }}>
              {new Date(item.date).toDateString()}
            </p>
            <p style={{ margin: 0 }}>{item.recipe.post.title}</p>
          </div>
          <button onClick={() => handleDelete(item.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
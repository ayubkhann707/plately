import { useEffect, useState } from "react";
import api from "../api/client";

export default function Grocery() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await api.get("/grocery");
      setItems(res.data);
    }

    load();
  }, []);

  return (
    <div>
      <h1>Grocery List</h1>

      {items.length === 0 && <p>Your grocery list is empty. Add something to your meal plan!</p>}

      {items.map((item, idx) => (
        <div key={idx} style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "6px 0",
          borderBottom: "1px solid #eee"
        }}>
          <span>{item.name}</span>
          <span>
            {item.quantity || "-"} {item.unit || ""}
          </span>
        </div>
      ))}
    </div>
  );
}

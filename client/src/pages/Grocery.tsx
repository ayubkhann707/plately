import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

type Ingredient = {
  id?: string;
  name: string;
  quantity?: string | number;
  unit?: string;
};

type GroceryRecipe = {
  id: string;
  date: string;
  mealType: string;
  recipe: {
    id: string;
    ingredients: Ingredient[];
    post: {
      id: string;
      title: string;
      imageUrl?: string;
      tags?: string[];
    };
  };
};

type Tab = "combined" | "recipes";

export default function Grocery() {
  const [recipes, setRecipes] = useState<GroceryRecipe[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("combined");
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [openRecipes, setOpenRecipes] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const selectedIds = JSON.parse(
        localStorage.getItem("groceryPlanItemIds") || "[]"
      );

      const res = await api.get("/plan");

      const filtered = res.data.filter((item: GroceryRecipe) =>
        selectedIds.includes(item.id)
      );

      setRecipes(filtered);
    }

    load();
  }, []);

  const combinedIngredients = useMemo(() => {
    return recipes.flatMap((item) =>
      item.recipe.ingredients.map((ingredient, index) => ({
        ...ingredient,
        key: `${item.id}-${ingredient.name}-${index}`,
        recipeTitle: item.recipe.post.title,
      }))
    );
  }, [recipes]);

  const sortedCombinedIngredients = useMemo(() => {
    return [...combinedIngredients].sort((a, b) => {
      const aChecked = checkedItems.includes(a.key);
      const bChecked = checkedItems.includes(b.key);

      if (aChecked === bChecked) return 0;
      return aChecked ? 1 : -1;
    });
  }, [combinedIngredients, checkedItems]);

  function toggleChecked(key: string) {
    setCheckedItems((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  }

  function toggleRecipe(recipeId: string) {
    setOpenRecipes((current) =>
      current.includes(recipeId)
        ? current.filter((id) => id !== recipeId)
        : [...current, recipeId]
    );
  }

  function clearAll() {
    localStorage.removeItem("groceryPlanItemIds");
    setRecipes([]);
    setCheckedItems([]);
    setOpenRecipes([]);
  }

  function removeRecipeFromGrocery(planItemId: string) {
    const updatedIds = recipes
      .filter((item) => item.id !== planItemId)
      .map((item) => item.id);

    localStorage.setItem("groceryPlanItemIds", JSON.stringify(updatedIds));

    setRecipes((current) => current.filter((item) => item.id !== planItemId));

    setCheckedItems((current) =>
      current.filter((key) => !key.startsWith(`${planItemId}-`))
    );

    setOpenRecipes((current) => current.filter((id) => id !== planItemId));
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0 }}>Grocery List</h1>

        <p style={{ color: "#64748b", marginTop: "8px" }}>
          Ingredients from recipes selected in your meal calendar
        </p>

        <button
          onClick={clearAll}
          disabled={recipes.length === 0}
          style={{
            marginTop: "14px",
            border: "1px solid #fecaca",
            background: recipes.length === 0 ? "#f8fafc" : "#fef2f2",
            color: recipes.length === 0 ? "#94a3b8" : "#dc2626",
            borderRadius: "14px",
            padding: "10px 16px",
            cursor: recipes.length === 0 ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          Clear all
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          background: "#f1f5f9",
          padding: "6px",
          borderRadius: "18px",
          marginBottom: "24px",
          width: "fit-content",
        }}
      >
        <button
          onClick={() => setActiveTab("combined")}
          style={{
            border: "none",
            borderRadius: "14px",
            padding: "10px 16px",
            cursor: "pointer",
            background: activeTab === "combined" ? "white" : "transparent",
            fontWeight: 700,
          }}
        >
          Combined ingredients
        </button>

        <button
          onClick={() => setActiveTab("recipes")}
          style={{
            border: "none",
            borderRadius: "14px",
            padding: "10px 16px",
            cursor: "pointer",
            background: activeTab === "recipes" ? "white" : "transparent",
            fontWeight: 700,
          }}
        >
          By recipes
        </button>
      </div>

      {recipes.length === 0 && (
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "22px",
            padding: "24px",
          }}
        >
          <p style={{ margin: 0 }}>
            Your grocery list is empty. Go to the meal calendar, open a planned
            slot, select recipes with checkboxes, then click Generate grocery
            list.
          </p>
        </div>
      )}

      {activeTab === "combined" && recipes.length > 0 && (
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "22px",
            overflow: "hidden",
          }}
        >
          {sortedCombinedIngredients.map((item) => {
            const isChecked = checkedItems.includes(item.key);

            return (
              <label
                key={item.key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "14px 18px",
                  borderBottom: "1px solid #f1f5f9",
                  cursor: "pointer",
                  textDecoration: isChecked ? "line-through" : "none",
                  color: isChecked ? "#94a3b8" : "#111827",
                  background: isChecked ? "#f8fafc" : "white",
                }}
              >
                <span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleChecked(item.key)}
                    style={{ marginRight: "10px" }}
                  />
                  {item.name}
                  <small style={{ color: "#94a3b8", marginLeft: "8px" }}>
                    {item.recipeTitle}
                  </small>
                </span>

                <span>
                  {item.quantity || "-"} {item.unit || ""}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {activeTab === "recipes" && recipes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {recipes.map((item) => {
            const isOpen = openRecipes.includes(item.id);

            return (
              <div
                key={item.id}
                style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "22px",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => toggleRecipe(item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px",
                    background: "white",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {item.recipe.post.imageUrl ? (
                    <img
                      src={item.recipe.post.imageUrl}
                      alt={item.recipe.post.title}
                      style={{
                        width: "72px",
                        height: "72px",
                        objectFit: "cover",
                        borderRadius: "18px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "18px",
                        background: "#f1f5f9",
                      }}
                    />
                  )}

                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0 }}>{item.recipe.post.title}</h3>
                    <p style={{ margin: "6px 0 0", color: "#94a3b8" }}>
                      {item.mealType} · {item.date.slice(0, 10)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecipeFromGrocery(item.id);
                    }}
                    style={{
                      border: "1px solid #fecaca",
                      background: "#fef2f2",
                      color: "#dc2626",
                      borderRadius: "14px",
                      padding: "9px 12px",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Remove
                  </button>

                  <span style={{ fontSize: "22px" }}>
                    {isOpen ? "⌃" : "⌄"}
                  </span>
                </button>

                {isOpen && (
                  <div style={{ padding: "0 18px 16px" }}>
                    {[...item.recipe.ingredients]
                      .map((ingredient, index) => ({
                        ingredient,
                        key: `${item.id}-${ingredient.name}-${index}`,
                      }))
                      .sort((a, b) => {
                        const aChecked = checkedItems.includes(a.key);
                        const bChecked = checkedItems.includes(b.key);

                        if (aChecked === bChecked) return 0;
                        return aChecked ? 1 : -1;
                      })
                      .map(({ ingredient, key }) => {
                        const isChecked = checkedItems.includes(key);

                        return (
                          <label
                            key={key}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "10px 0",
                              borderTop: "1px solid #f1f5f9",
                              cursor: "pointer",
                              textDecoration: isChecked
                                ? "line-through"
                                : "none",
                              color: isChecked ? "#94a3b8" : "#111827",
                              background: isChecked ? "#f8fafc" : "white",
                            }}
                          >
                            <span>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleChecked(key)}
                                style={{ marginRight: "10px" }}
                              />
                              {ingredient.name}
                            </span>

                            <span>
                              {ingredient.quantity || "-"} {ingredient.unit || ""}
                            </span>
                          </label>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
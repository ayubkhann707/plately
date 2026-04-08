export default function RecipeCard({ post, onOpen }: any) {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "12px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      <h3>{post.title}</h3>

      <p>{post.recipe?.timeMinutes} min • {post.recipe?.servings} servings</p>

      <ul>
        {post.recipe?.ingredients.slice(0, 3).map((i: any) => (
          <li key={i.name}>{i.name}</li>
        ))}
      </ul>

      <button onClick={onOpen} style={{
        padding: "8px 12px",
        borderRadius: "8px",
        border: "none",
        background: "#4CAF50",
        color: "white",
        cursor: "pointer"
      }}>
        Open →
      </button>
    </div>
  );
}

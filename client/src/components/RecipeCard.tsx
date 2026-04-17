export default function RecipeCard({ post, onOpen, onToggleSave }: any) {
  return (
    <div 
      onClick={onOpen}
      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.01)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      style={{
        border: "1px solid #eee",
        borderRadius: "12px",
        padding: "16px",
        background: "#fff",
        transition: "transform 0.15s ease",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ margin: 0 }}>{post.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(post.id);
          }}
          style={{
            background: post.isSaved ? "#ccc" : "#4CAF50",
            color: "white",
            padding: "6px 12px",
            borderRadius: "20px",
            border: "none",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          {post.isSaved ? "Saved ✓" : "Save"}
        </button>
      </div>

      <p style={{ margin: "8px 0" }}>{post.recipe?.timeMinutes} min • {post.recipe?.servings} servings</p>

      <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
        {post.recipe?.ingredients.slice(0, 3).map((i: any) => (
          <li key={i.name}>{i.name}</li>
        ))}
      </ul>

      <div style={{ marginTop: "8px" }}>
        {post.tags?.map((tag: string) => (
          <span key={tag} style={{
            background: "#eee",
            padding: "4px 8px",
            borderRadius: "6px",
            marginRight: "6px",
            fontSize: "12px"
          }}>
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

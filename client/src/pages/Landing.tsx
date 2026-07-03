import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/app", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "white" }}>
      {/* Navigation */}
      <nav style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "20px 40px",
        borderBottom: "1px solid #f3f4f6"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ 
            width: "32px", 
            height: "32px", 
            backgroundColor: "#16a34a", 
            borderRadius: "8px" 
          }}></div>
          <span style={{ fontSize: "20px", fontWeight: "bold", color: "#111827" }}>Plately</span>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Link to="/login" style={{ color: "#4b5563", textDecoration: "none", fontWeight: 500 }}>Log in</Link>
          <Link to="/register" style={{ 
            backgroundColor: "#16a34a", 
            color: "white", 
            padding: "10px 20px", 
            borderRadius: "12px", 
            textDecoration: "none",
            fontWeight: 600
          }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "100px 40px",
        textAlign: "center"
      }}>
        <h1 style={{ 
          fontSize: "64px", 
          fontWeight: 800, 
          color: "#111827", 
          marginBottom: "24px",
          lineHeight: 1.1
        }}>
          Master your meals with <span style={{ color: "#16a34a" }}>Plately</span>
        </h1>
        <p style={{ 
          fontSize: "20px", 
          color: "#4b5563", 
          marginBottom: "40px",
          maxWidth: "700px",
          margin: "0 auto 40px"
        }}>
          Plan your week, discover new recipes, and automate your grocery list. 
          The smarter way to eat well and save time.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <Link to="/register" style={{ 
            backgroundColor: "#16a34a", 
            color: "white", 
            padding: "16px 32px", 
            borderRadius: "16px", 
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "18px"
          }}>Start Planning Now — Free</Link>
        </div>
      </main>

      {/* Features */}
      <section style={{ 
        backgroundColor: "#f8fafc", 
        padding: "100px 40px"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "40px" 
          }}>
            <div style={{ 
              background: "white", 
              padding: "32px", 
              borderRadius: "24px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}>
              <div style={{ color: "#16a34a", marginBottom: "16px", fontSize: "24px" }}>📅</div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>Meal Planning</h3>
              <p style={{ color: "#6b7280", lineHeight: 1.6 }}>Drag and drop recipes into your week. Stay organized and never wonder "what's for dinner" again.</p>
            </div>
            <div style={{ 
              background: "white", 
              padding: "32px", 
              borderRadius: "24px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}>
              <div style={{ color: "#16a34a", marginBottom: "16px", fontSize: "24px" }}>🛒</div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>Smart Grocery List</h3>
              <p style={{ color: "#6b7280", lineHeight: 1.6 }}>Automatically generate your shopping list from your meal plan. Cross off items as you shop.</p>
            </div>
            <div style={{ 
              background: "white", 
              padding: "32px", 
              borderRadius: "24px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}>
              <div style={{ color: "#16a34a", marginBottom: "16px", fontSize: "24px" }}>🍳</div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>Recipe Library</h3>
              <p style={{ color: "#6b7280", lineHeight: 1.6 }}>Import recipes from anywhere on the web or create your own favorites in one central place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: "60px 40px", 
        textAlign: "center", 
        borderTop: "1px solid #f3f4f6",
        color: "#9ca3af"
      }}>
        <p>© 2026 Plately. All rights reserved.</p>
      </footer>
    </div>
  );
}

import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <nav style={{
        display: "flex",
        gap: "16px",
        padding: "12px 0",
        borderBottom: "1px solid #eee"
      }}>
        <Link to="/">Feed</Link>
        <Link to="/library">Library</Link>
        <Link to="/plan">Plan</Link>
        <Link to="/grocery">Grocery</Link>
        <Link to="/profile">Profile</Link>
      </nav>

      <div style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "16px"
      }}>
        <Outlet />
      </div>
    </div>
  );
}

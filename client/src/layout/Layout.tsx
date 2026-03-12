import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <nav
        style={{
          display: "flex",
          gap: 20,
          padding: 10,
          borderBottom: "1px solid gray",
        }}
      >
        <Link to="/">Feed</Link>
        <Link to="/library">Library</Link>
        <Link to="/plan">Plan</Link>
        <Link to="/profile">Profile</Link>
      </nav>

      <div style={{ padding: 20 }}>
        <Outlet />
      </div>
    </div>
  );
}

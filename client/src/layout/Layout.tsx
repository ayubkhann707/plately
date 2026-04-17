import { Link, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();
  const isDashboardPage = location.pathname === "/";

  if (isDashboardPage) {
    return <Outlet />;
  }

  return (
    <div>
      <nav
        style={{
          display: "flex",
          gap: "16px",
          padding: "16px 24px",
          borderBottom: "1px solid #eee",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Link to="/">Home</Link>
        <Link to="/feed">Feed</Link>
        <Link to="/library">Library</Link>
        <Link to="/import">Import</Link>
        <Link to="/grocery">Grocery</Link>
        <Link to="/profile">Profile</Link>
      </nav>

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "24px 16px",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  CalendarDays,
  BookOpen,
  UtensilsCrossed,
  ShoppingCart,
  Settings,
  Leaf,
  SquarePen,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/app", label: "Meal Plan", icon: CalendarDays },
  { to: "/app/library", label: "Recipes", icon: BookOpen },
  { to: "/app/feed", label: "Discover", icon: UtensilsCrossed },
  { to: "/app/create", label: "Create Post", icon: SquarePen },
  { to: "/app/grocery", label: "Grocery List", icon: ShoppingCart },
];

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when location changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  function getNavTo(to: string) {
    if (to === "/app/grocery") {
      return localStorage.getItem("grocery_last_url") || "/app/grocery";
    }

    return to;
  }

  function handleLogout() {
    localStorage.removeItem("grocery_last_url");
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-30">
        <Link to="/app" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
            <Leaf size={14} className="text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900 tracking-tight">
            Plately
          </span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out transform
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:inset-0 lg:min-h-screen shrink-0
        `}
      >
        <div className="px-6 py-6 flex items-center justify-between lg:justify-start gap-3">
          <Link to="/app" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="text-2xl font-semibold text-gray-900 tracking-tight">
              Plately
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="px-4 pt-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const navTo = getNavTo(item.to);

            return (
              <NavLink
                key={item.label + item.to}
                to={navTo}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium transition-all ${
                    isActive
                      ? "bg-green-50 text-green-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="px-4 pt-6 pb-4 border-t border-gray-100 mt-4">
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium transition-all ${
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`
            }
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all mt-1"
          >
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="w-full px-4 sm:px-8 py-6 sm:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
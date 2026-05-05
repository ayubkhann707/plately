import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  BookOpen,
  UtensilsCrossed,
  ShoppingCart,
  Settings,
  Leaf,
  SquarePen,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Meal Plan", icon: CalendarDays },
  { to: "/library", label: "Recipes", icon: BookOpen },
  { to: "/feed", label: "Discover", icon: UtensilsCrossed },
  { to: "/create", label: "Create Post", icon: SquarePen },
  { to: "/grocery", label: "Grocery List", icon: ShoppingCart },
];

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function getNavTo(to: string) {
    if (to === "/grocery") {
      return localStorage.getItem("grocery_last_url") || "/grocery";
    }

    return to;
  }

  function handleLogout() {
    localStorage.removeItem("grocery_last_url");
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-72 shrink-0 bg-white border-r border-gray-100 min-h-screen">
        <div className="px-6 py-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="text-2xl font-semibold text-gray-900 tracking-tight">
            Plately
          </span>
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
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all">
            <Settings size={20} />
            <span>Settings</span>
          </button>

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
        <div className="w-full px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
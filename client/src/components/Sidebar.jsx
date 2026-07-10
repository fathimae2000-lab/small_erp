import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  ShoppingCart,
  ShoppingBag,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import NavItem from "./NavItem";

const NAV_ITEMS = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Customers", icon: Users },
  { name: "Products", icon: Package },
  { name: "Inventory", icon: Boxes },
  { name: "Orders", icon: ShoppingCart },
  { name: "Purchases", icon: ShoppingBag },
  { name: "Users", icon: UserCog },
  { name: "Reports", icon: BarChart3 },
];

export default function Sidebar({ active, onSelect, open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login"); // adjust to your actual login route
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-60 flex-col bg-gradient-to-r from-[#131E4D] to-[#2B54D6] transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4FD5F0] to-[#2B54D6] text-sm font-semibold text-white">
            E
          </div>
          <span className="text-base font-semibold text-white">
            Ergonest
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV_ITEMS.map(({ name, icon }) => (
            <NavItem
              key={name}
              name={name}
              icon={icon}
              active={name === active}
              onClick={() => onSelect(name)}
            />
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-indigo-200/70 transition-all duration-150 hover:translate-x-0.5 hover:text-rose-300"
          >
            <LogOut
              size={17}
              className="text-indigo-300/70 transition-colors duration-150 group-hover:text-rose-300"
            />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

export { NAV_ITEMS };
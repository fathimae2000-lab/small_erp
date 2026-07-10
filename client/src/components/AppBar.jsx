import { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  X,
  Package,
  ShoppingCart,
  User as UserIcon,
  Users,
  FileText,
  Command,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function AppBar({ title, onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  // Controls the mobile/collapsed search overlay — desktop search is always visible,
  // mobile search is hidden behind the icon until opened (or triggered via shortcut)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // References to detect clicks outside elements / focus the input programmatically
  const searchContainerRef = useRef(null);
  const desktopSearchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  // Detect mac vs windows/linux for the shortcut hint (⌘K vs Ctrl+K)
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  // 1. Debounced API Search Logic — now hits a global search endpoint that spans
  // products, orders, customers, and invoices
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/dashboard/search?q=${encodeURIComponent(searchQuery)}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setSearchResults(response.data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // 2. Click Outside Handler (closes dropdown + collapses mobile overlay when clicking elsewhere)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchResults(null);
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Global keyboard shortcut — Cmd/Ctrl+K focuses search from anywhere in the app,
  // Escape blurs/closes it. This is what makes the search "global" rather than
  // scoped to whichever page happens to render it.
  useEffect(() => {
    const handleGlobalKeydown = (event) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isShortcut) {
        event.preventDefault();
        const isMobileViewport = window.innerWidth < 640; // Tailwind's `sm` breakpoint
        if (isMobileViewport) {
          setMobileSearchOpen(true);
          // Wait a tick for the mobile overlay to mount before focusing
          requestAnimationFrame(() => mobileSearchInputRef.current?.focus());
        } else {
          desktopSearchInputRef.current?.focus();
        }
        return;
      }

      if (event.key === "Escape") {
        const active = document.activeElement;
        if (active === desktopSearchInputRef.current || active === mobileSearchInputRef.current) {
          active.blur();
          setSearchResults(null);
          setMobileSearchOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeydown);
    return () => document.removeEventListener("keydown", handleGlobalKeydown);
  }, []);

  // 4. Navigation Actions
  const handleItemClick = (targetUrl) => {
    navigate(targetUrl);
    setSearchQuery("");
    setSearchResults(null);
    setMobileSearchOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return "UN";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
  };

  const hasAnyResults =
    searchResults &&
    ["products", "orders", "customers", "invoices"].some((k) => searchResults[k]?.length > 0);

  // Shared results dropdown, reused by both the desktop bar and the mobile overlay
  const renderResultsDropdown = () => {
    if (!searchResults) return null;
    return (
      <div className="absolute top-full left-0 z-50 mt-1 w-full max-h-80 overflow-y-auto rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
        {isSearching ? (
          <p className="p-3 text-xs text-slate-400 animate-pulse text-center">Searching ERP...</p>
        ) : (
          <div className="flex flex-col gap-2">
            {/* PRODUCTS MATCHED */}
            {searchResults.products?.length > 0 && (
              <div>
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Products
                </p>
                {searchResults.products.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => handleItemClick(`/products?search=${p.name}`)}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 cursor-pointer"
                  >
                    <Package size={14} className="text-slate-500" />
                    <span className="text-sm text-slate-700">{p.name}</span>
                    <span className="ml-auto text-xs font-medium text-slate-500">${p.price}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ORDERS MATCHED */}
            {searchResults.orders?.length > 0 && (
              <div>
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Orders
                </p>
                {searchResults.orders.map((o) => (
                  <div
                    key={o._id}
                    onClick={() => handleItemClick(`/orders?id=${o._id}`)}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 cursor-pointer"
                  >
                    <ShoppingCart size={14} className="text-slate-500" />
                    <span className="text-sm text-slate-700">Order #{o._id.toString().slice(-4)}</span>
                    <span className="text-xs text-slate-400">({o.customerName || "Walk-in"})</span>
                    <span className="ml-auto text-xs font-medium text-slate-800">${o.totalAmount}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CUSTOMERS MATCHED */}
            {searchResults.customers?.length > 0 && (
              <div>
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Customers
                </p>
                {searchResults.customers.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => handleItemClick(`/customers?id=${c._id}`)}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 cursor-pointer"
                  >
                    <Users size={14} className="text-slate-500" />
                    <span className="text-sm text-slate-700">{c.name}</span>
                    {c.email && <span className="ml-auto text-xs text-slate-400">{c.email}</span>}
                  </div>
                ))}
              </div>
            )}

     

            {/* NO RESULTS FOUND */}
            {!hasAnyResults && (
              <p className="p-4 text-xs text-slate-400 text-center">No matches found for "{searchQuery}"</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-[#2B54D6]/10 hover:text-[#2B54D6] lg:hidden"
        >
          <Menu size={19} />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      {/* 🔍 DESKTOP SEARCH — always visible, always reachable via Cmd/Ctrl+K */}
      <div ref={searchContainerRef} className="relative hidden max-w-md flex-1 sm:block">
        <div className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition-colors focus-within:border-[#2B54D6]/40 focus-within:bg-white">
          <Search size={16} className="text-slate-400" />
          <input
            ref={desktopSearchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, products, customers, invoices..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults(null);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          ) : (
            <span className="flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              {isMac ? <Command size={10} /> : "Ctrl"}
              <span>K</span>
            </span>
          )}
        </div>

        {renderResultsDropdown()}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* 🔍 MOBILE SEARCH TRIGGER — reveals the same dropdown-style search inline */}
        <button
          onClick={() => {
            setMobileSearchOpen((v) => !v);
            requestAnimationFrame(() => mobileSearchInputRef.current?.focus());
          }}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-[#2B54D6]/10 hover:text-[#2B54D6] sm:hidden"
        >
          <Search size={18} />
        </button>

        <button className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-[#2B54D6]/10 hover:text-[#2B54D6]">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-[#2B54D6]/10"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#4FD5F0] to-[#2B54D6] text-xs font-semibold text-white shadow-sm">
              {getInitials(user?.name)}
            </div>
            <span className="hidden text-sm font-medium text-slate-700 sm:block">
              {user?.name || "User"}
            </span>
            <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg">
              {user?.role && (
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 mb-1">
                  Role: {user.role}
                </div>
              )}
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-[#2B54D6]/10 hover:text-[#2B54D6]"
              >
                <UserIcon size={14} />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-rose-500 transition-colors hover:bg-rose-50"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🔍 MOBILE SEARCH OVERLAY — sits below the header, full width, same dropdown behavior */}
      {mobileSearchOpen && (
        <div className="absolute left-0 top-full z-30 w-full border-b border-slate-200 bg-white p-3 shadow-md sm:hidden">
          <div className="relative">
            <div className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-[#2B54D6]/40 focus-within:bg-white">
              <Search size={16} className="text-slate-400" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, products, customers..."
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults(null);
                  setMobileSearchOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            </div>
            {renderResultsDropdown()}
          </div>
        </div>
      )}
    </header>
  );
}
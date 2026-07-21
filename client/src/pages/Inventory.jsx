import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Boxes,
  AlertTriangle,
  Ban,
  ArrowRightLeft,
  Plus,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import { fetchInventoryDashboard, updateStockInventory } from "../redux/slices/inventroySlice";
import AdjustStockModal from "../modal/AdjustStockModal";

const badgeClasses = {
  danger: "bg-rose-50 text-rose-600",
  warning: "bg-amber-50 text-amber-600",
  success: "bg-emerald-50 text-emerald-600",
};

function StatCard({ label, value, icon: Icon, from, to, blob }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_16px_32px_-10px_rgba(30,41,90,0.28)]">
      <div
        className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-[0.10] blur-2xl transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: blob }}
      />

      <div className="relative flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
          style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          <Icon size={17} />
        </div>
      </div>

      <p className="relative mt-3 text-[13px] text-slate-500">{label}</p>
      <p
        className="relative bg-clip-text text-[26px] font-semibold leading-tight text-transparent"
        style={{ backgroundImage: `linear-gradient(90deg, ${from}, ${to})` }}
      >
        {value}
      </p>
    </div>
  );
}

export default function Inventory() {
  const dispatch = useDispatch();

  const { summary, inventoryList, lowStockList, loading } = useSelector((state) => state.inventory);

  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("All warehouses");
  const [stockFilter, setStockFilter] = useState("All stock");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null); 

  useEffect(() => {
    dispatch(fetchInventoryDashboard());
  }, [dispatch]);

  // --- DYNAMIC CALCULATIONS FOR YOUR ORIGINAL STAT CARDS ---
  const outOfStockCount = inventoryList.filter((item) => (item.stock || 0) === 0).length;

  const dynamicStats = [
    {
      label: "Total stock value",
      value: `$${(summary.totalStockValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Boxes,
      from: "#2B54D6",
      to: "#4FD5F0",
      blob: "#2B54D6",
    },
    {
      label: "Low stock items",
      value: String(summary.lowStockCount || 0),
      icon: AlertTriangle,
      from: "#B7791F",
      to: "#F0B84F",
      blob: "#B7791F",
    },
    {
      label: "Out of stock",
      value: String(outOfStockCount),
      icon: Ban,
      from: "#C0392B",
      to: "#F0836B",
      blob: "#C0392B",
    },
    {
      label: "Total Unique Products",
      value: String(summary.totalUniqueItems || 0),
      icon: ArrowRightLeft,
      from: "#5B3FE0",
      to: "#8B7BFF",
      blob: "#5B3FE0",
    },
  ];

  const handleAdjustStockSave = async (adjustmentData) => {
    try {
      await dispatch(updateStockInventory(adjustmentData)).unwrap();
      alert("Stock adjusted successfully!");
    } catch (error) {
      console.error("Failed to adjust stock:", error);
      alert(error || "Something went wrong!");
    }
  };

  const openAddModal = () => {
    setEditingProductId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProductId(product._id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProductId(null);
  };

  // --- REAL-TIME FRONTEND FILTER LOGIC ---
  const filteredInventory = inventoryList.filter((item) => {
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(search.toLowerCase())) ||
      (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));

    // Stock Filter Logic
    let matchesStock = true;
    if (stockFilter === "In stock") matchesStock = (item.stock || 0) > 0;
    else if (stockFilter === "Low stock") matchesStock = (item.stock || 0) > 0 && (item.stock || 0) < 10;
    else if (stockFilter === "Out of stock") matchesStock = (item.stock || 0) === 0;

    return matchesSearch && matchesStock;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3F5FA] to-[#EDF0F9] p-6 text-slate-900">
      
      {/* Dynamic Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {dynamicStats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Filters Section */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">

        <select
          value={warehouse}
          onChange={(e) => setWarehouse(e.target.value)}
          className="w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-[#2B54D6]/40"
        >
          <option>All warehouses</option>
          <option>Main warehouse</option>
          <option>Warehouse B</option>
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-[#2B54D6]/40"
        >
          <option>All stock</option>
          <option>In stock</option>
          <option>Low stock</option>
          <option>Out of stock</option>
        </select>

        <button
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#2B54D6] to-[#4FD5F0] px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          onClick={openAddModal}
        >
          <Plus size={16} />
          Adjust stock
        </button>
      </div>

      {/* Dynamic Data Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-sm font-medium text-slate-400 animate-pulse">
            Loading real-time inventory status...
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="py-12 text-center text-sm font-medium text-slate-400">
            No matching inventory items found.
          </div>
        ) : (
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="bg-[#F7F9FE] text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th className="w-[28%] px-3 py-3 font-medium">Product</th>
                <th className="w-[16%] px-3 py-3 font-medium">Category</th>
                <th className="w-[14%] px-3 py-3 text-right font-medium">In stock</th>
                <th className="w-[14%] px-3 py-3 text-right font-medium">Price</th>
                <th className="w-[12%] px-3 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item, i) => {
                let currentLevel = "success";
                if ((item.stock || 0) === 0) currentLevel = "danger";
                else if ((item.stock || 0) < 10) currentLevel = "warning";

                return (
                  <tr
                    key={item._id || item.sku}
                    className={`group transition-colors duration-150 hover:bg-[#F7F9FE] ${
                      i > 0 ? "border-t border-slate-50" : ""
                    }`}
                  >
                    <td className="px-3 py-3 font-medium text-slate-800 truncate">{item.name}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 capitalize">
                        {item.category || "General"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${badgeClasses[currentLevel]}`}>
                        {item.stock || 0}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-slate-500">
                      ${Number(item.price || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => openEditModal(item)}
                        className="rounded-md p-1.5 text-slate-400 transition-colors duration-150 hover:bg-[#2B54D6]/10 hover:text-[#2B54D6]"
                      >
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer Context */}
      <div className="mt-4 flex items-center justify-around text-sm text-slate-500">
        <span>Showing {filteredInventory.length} of {inventoryList.length} products</span>
        <div className="flex items-center gap-1.5">
          <button className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm transition-colors hover:border-[#2B54D6]/30 hover:text-[#2B54D6]">
            <ChevronLeft size={14} />
          </button>
          <button className="rounded-md bg-gradient-to-r from-[#2B54D6] to-[#4FD5F0] px-3 py-1.5 font-medium text-white shadow-sm">
            1
          </button>
          <button className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm transition-colors hover:border-[#2B54D6]/30 hover:text-[#2B54D6]">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* connected adjust stock */}
      <AdjustStockModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleAdjustStockSave}
        initialProductId={editingProductId}
      />
    </div>
  );
}
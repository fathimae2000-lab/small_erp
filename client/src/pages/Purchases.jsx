import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ClipboardList,
  Clock,
  PackageCheck,
  DollarSign,
  Plus,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import AddPurchaseModal from "../modal/AddPurchaseModal";
import { fetchPurchases } from "../redux/slices/PurchaseSlice"; 

const statusClasses = {
  Pending: "bg-amber-50 text-amber-600",
  Received: "bg-emerald-50 text-emerald-600",
  Cancelled: "bg-rose-50 text-rose-600",
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

export default function Purchases() {
  const dispatch = useDispatch();
  
  const { purchases, loading } = useSelector((state) => state.purchases);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All status");

  useEffect(() => {
    dispatch(fetchPurchases());
  }, [dispatch]);

  // --- DYNAMIC CALCULATIONS FOR STAT CARDS ---
  const totalPurchasesCount = purchases.length;
  const pendingCount = purchases.filter((p) => p.paymentMode === "Credit" || p.status === "Pending").length; 
  const receivedCount = purchases.filter((p) => p.status === "Received" || !p.status).length; // Default received
  const totalSpendSum = purchases.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  const dynamicStats = [
    {
      label: "Total purchases",
      value: String(totalPurchasesCount),
      icon: ClipboardList,
      from: "#2B54D6",
      to: "#4FD5F0",
      blob: "#2B54D6",
    },
    {
      label: "Pending Bills",
      value: String(pendingCount),
      icon: Clock,
      from: "#B7791F",
      to: "#F0B84F",
      blob: "#B7791F",
    },
    {
      label: "Received Entries",
      value: String(receivedCount),
      icon: PackageCheck,
      from: "#0E7C8C",
      to: "#4FD5C5",
      blob: "#0E7C8C",
    },
    {
      label: "Total spend",
      value: `$${totalSpendSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      from: "#5B3FE0",
      to: "#8B7BFF",
      blob: "#5B3FE0",
    },
  ];

  // --- FILTER & SEARCH IMPLEMENTATION ---
  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      (p.supplierName && p.supplierName.toLowerCase().includes(search.toLowerCase())) ||
      (p._id && p._id.toLowerCase().includes(search.toLowerCase()));

    const currentStatus = p.status || (p.paymentMode === "Credit" ? "Pending" : "Received");
    const matchesStatus = status === "All status" || currentStatus === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3F5FA] to-[#EDF0F9] p-6 text-slate-900">
      
      {/* Dynamic Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {dynamicStats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Filters and Search Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition-colors focus-within:border-[#2B54D6]/40">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by supplier or bill ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-[#2B54D6]/40"
        >
          <option>All status</option>
          <option>Pending</option>
          <option>Received</option>
          <option>Cancelled</option>
        </select>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#2B54D6] to-[#4FD5F0] px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Plus size={16} />
          New purchase
        </button>
      </div>

      {/* Purchases Data Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-sm font-medium text-slate-400 animate-pulse">Loading procurement logs...</div>
        ) : filteredPurchases.length === 0 ? (
          <div className="py-12 text-center text-sm font-medium text-slate-400">No purchase records found.</div>
        ) : (
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="bg-[#F7F9FE] text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th className="w-[15%] px-3 py-3 font-medium">PO number</th>
                <th className="w-[24%] px-3 py-3 font-medium">Supplier</th>
                <th className="w-[14%] px-3 py-3 font-medium">Date</th>
                <th className="w-[10%] px-3 py-3 font-medium">Items</th>
                <th className="w-[14%] px-3 py-3 text-right font-medium">Total</th>
                <th className="w-[13%] px-3 py-3 font-medium">Status</th>
                <th className="w-[12%] px-3 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((p, i) => {
                const itemQtyCount = p.items ? p.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
                const calculatedStatus = p.status || (p.paymentMode === "Credit" ? "Pending" : "Received");

                return (
                  <tr
                    key={p._id}
                    className={`group transition-colors duration-150 hover:bg-[#F7F9FE] ${
                      i > 0 ? "border-t border-slate-50" : ""
                    }`}
                  >
                    <td className="px-3 py-3 font-medium text-[#2B54D6] truncate" title={p._id}>
                      #{p._id ? p._id.substring(p._id.length - 6).toUpperCase() : "N/A"}
                    </td>
                    <td className="px-3 py-3 text-slate-800 truncate">{p.supplierName}</td>
                    <td className="px-3 py-3 text-slate-500 whitespace-nowrap">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "Recent"}
                    </td>
                    <td className="px-3 py-3 text-slate-600">{itemQtyCount}</td>
                    <td className="px-3 py-3 text-right font-medium text-slate-800">
                      ${Number(p.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusClasses[calculatedStatus]}`}>
                        {calculatedStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-[#2B54D6]/10 hover:text-[#2B54D6]">
                          <Eye size={15} />
                        </button>
                        <button className="rounded-md p-1.5 text-slate-400 transition-colors duration-150 hover:bg-[#2B54D6]/10 hover:text-[#2B54D6]">
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination View Context */}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>Showing {filteredPurchases.length} of {totalPurchasesCount} entries</span>
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

      {/* Connected Add Purchase Modal */}
      <AddPurchaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
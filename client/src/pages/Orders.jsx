import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ShoppingCart,
  Clock,
  CircleCheck,
  X,
  Plus,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import AddOrderModal from "../modal/AddOrderModal";
import { fetchOrders } from "../redux/slices/saleSlice";

const statusClasses = {
  Pending: "bg-amber-50 text-amber-600",
  Completed: "bg-emerald-50 text-emerald-600",
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

export default function Orders() {
  const dispatch = useDispatch();

  // FIX: Switched from state.orders to state.sales to match fetchOrders from saleSlice
  // Added '= []' fallback to prevent app from crashing if orders is initially undefined
  const { orders = [], loading } = useSelector((state) => state.sales);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All status");
  const [date, setDate] = useState("");

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const totalCount = orders.length;
  const completedCount = orders.filter((o) => o.status === "Completed").length;
  const cancelledCount = orders.filter((o) => o.status === "Cancelled").length;

  const dynamicStats = [
    { label: "Total orders", value: String(totalCount), icon: ShoppingCart, from: "#2B54D6", to: "#4FD5F0", blob: "#2B54D6" },
    { label: "Completed", value: String(completedCount), icon: CircleCheck, from: "#0E7C8C", to: "#4FD5C5", blob: "#0E7C8C" },
    { label: "Cancelled", value: String(cancelledCount), icon: X, from: "#C0392B", to: "#F0836B", blob: "#C0392B" },
  ];

const filteredOrders = orders.filter((order) => {
  const matchesSearch =
    (order.customer?.name && order.customer.name.toLowerCase().includes(search.toLowerCase())) ||
    (order._id && order._id.toLowerCase().includes(search.toLowerCase()));

  const matchesStatus = status === "All status" || order.status === status;
  const matchesDate = !date || (order.createdAt && order.createdAt.startsWith(date));

  return matchesSearch && matchesStatus && matchesDate;
});

  
  const openAddModal = () => {
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3F5FA] to-[#EDF0F9] p-6 text-slate-900">

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {dynamicStats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition-colors focus-within:border-[#2B54D6]/40">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer or order ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
          />
        </div>
        
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-[#2B54D6]/40"
        />
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#2B54D6] to-[#4FD5F0] px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Plus size={16} />
          New order
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-sm font-medium text-slate-400">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-sm font-medium text-slate-400">No matching orders found.</div>
        ) : (
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="bg-[#F7F9FE] text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th className="w-[15%] px-3 py-3 font-medium">Order ID</th>
                <th className="w-[24%] px-3 py-3 font-medium">Customer</th>
                <th className="w-[14%] px-3 py-3 font-medium">Date</th>
                <th className="w-[10%] px-3 py-3 font-medium">Items</th>
                <th className="w-[12%] px-3 py-3 text-right font-medium">Total</th>
                <th className="w-[12%] px-3 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o, i) => (
                <tr
                  key={o._id}
                  className={`group transition-colors duration-150 hover:bg-[#F7F9FE] ${
                    i > 0 ? "border-t border-slate-50" : ""
                  }`}
                >
                  <td className="px-3 py-3 font-medium text-[#2B54D6] truncate" title={o._id}>
                    #{o._id ? o._id.substring(o._id.length - 6).toUpperCase() : "N/A"}
                  </td>
                 <td className="px-3 py-3 text-slate-800 truncate">
  {o.customer?.name || "Walk-in Customer"}
</td>
                  <td className="px-3 py-3 text-slate-500 whitespace-nowrap">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "Recent"}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {o.items ? o.items.reduce((totalQty, item) => totalQty + (item.quantity || 0), 0) : 0}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-slate-800">
                    ${Number(o.totalAmount || 0).toFixed(2)}
                  </td>
                
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-[#2B54D6]/10 hover:text-[#2B54D6]">
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEditModal(o)}
                        className="rounded-md p-1.5 text-slate-400 transition-colors duration-150 hover:bg-[#2B54D6]/10 hover:text-[#2B54D6]"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>Showing {filteredOrders.length} of {totalCount} records</span>
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

      <AddOrderModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        order={editingOrder}
      />
    </div>
  );
}
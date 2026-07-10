import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users, UserPlus, Repeat, DollarSign, Plus, Pencil,
  ChevronLeft, ChevronRight, Search,
} from "lucide-react";
import AddCustomerModal from "../modal/AddCustomerModal";
import { fetchCustomers } from "../redux/slices/customerSlice";



function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

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

export default function Customers() {
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.customers);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All customers");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  // derive stats from real data
  const totalCustomers = customers.length;

  const now = new Date();
  const newThisMonth = customers.filter((c) => {
    if (!c.createdAt) return false;
    const created = new Date(c.createdAt);
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;

  const repeatBuyers = customers.filter((c) => (c.ordersCount ?? 0) > 1).length;
  const totalSpent = customers.reduce((sum, c) => sum + (Number(c.totalSpent) || 0), 0);
  const totalOrders = customers.reduce((sum, c) => sum + (Number(c.ordersCount) || 0), 0);
  const avgOrderValue = totalOrders > 0 ? (totalSpent / totalOrders).toFixed(0) : 0;

  const STATS = [
    { label: "Total customers", value: String(totalCustomers), icon: Users, from: "#2B54D6", to: "#4FD5F0", blob: "#2B54D6" },
    { label: "New this month", value: String(newThisMonth), icon: UserPlus, from: "#5B3FE0", to: "#8B7BFF", blob: "#5B3FE0" },
    { label: "Repeat buyers", value: String(repeatBuyers), icon: Repeat, from: "#0E7C8C", to: "#4FD5C5", blob: "#0E7C8C" },
    { label: "Avg order value", value: `$${avgOrderValue}`, icon: DollarSign, from: "#B7791F", to: "#F0B84F", blob: "#B7791F" },
  ];

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);

    const matchesFilter =
      filter === "All customers" ||
      (filter === "Repeat buyers" && (c.ordersCount ?? 0) > 1) ||
      (filter === "New this month" &&
        c.createdAt &&
        new Date(c.createdAt).getMonth() === now.getMonth() &&
        new Date(c.createdAt).getFullYear() === now.getFullYear());

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  const paginatedCustomers = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const openAddModal = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingCustomer(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#F3F5FA] to-[#EDF0F9] p-6 text-slate-900">
        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <div className="flex min-w-[180px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition-colors focus-within:border-[#2B54D6]/40">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-[#2B54D6]/40"
          >
            <option>All customers</option>
            <option>Repeat buyers</option>
            <option>New this month</option>
          </select>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#2B54D6] to-[#4FD5F0] px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
          >
            <Plus size={16} />
            Add customer
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="bg-[#F7F9FE] text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th className="w-[26%] px-3 py-3 font-medium">Name</th>
                <th className="w-[26%] px-3 py-3 font-medium">Email</th>
                <th className="w-[16%] px-3 py-3 font-medium">Phone</th>
                <th className="w-[12%] px-3 py-3 text-right font-medium">Orders</th>
                <th className="w-[12%] px-3 py-3 text-right font-medium">Total spent</th>
                <th className="w-[8%] px-3 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                    Loading customers...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-rose-500">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                    No customers found
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c, i) => (
                  <tr
                    key={c._id || c.email || i}
                    className={`group transition-colors duration-150 hover:bg-[#F7F9FE] ${
                      i > 0 ? "border-t border-slate-50" : ""
                    }`}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2B54D6]/10 to-[#4FD5F0]/10 text-[11px] font-semibold text-[#2B54D6]">
                          {getInitials(c.name)}
                        </div>
                        <span className="font-medium text-slate-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{c.email}</td>
                    <td className="px-3 py-3 text-slate-600">{c.phone}</td>
                    <td className="px-3 py-3 text-right text-slate-700">{c.ordersCount ?? 0}</td>
                    <td className="px-3 py-3 text-right font-medium text-slate-800">
                      ${Number(c.totalSpent ?? 0).toFixed(0)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => openEditModal(c)}
                        className="rounded-md p-1.5 text-slate-400 transition-colors duration-150 hover:bg-[#2B54D6]/10 hover:text-[#2B54D6]"
                      >
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm transition-colors hover:border-[#2B54D6]/30 hover:text-[#2B54D6] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-500"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .slice(0, 7)
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={
                    page === currentPage
                      ? "rounded-md bg-gradient-to-r from-[#2B54D6] to-[#4FD5F0] px-3 py-1.5 font-medium text-white shadow-sm"
                      : "rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-600 shadow-sm transition-colors hover:border-[#2B54D6]/30 hover:text-[#2B54D6]"
                  }
                >
                  {page}
                </button>
              ))}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm transition-colors hover:border-[#2B54D6]/30 hover:text-[#2B54D6] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-500"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <AddCustomerModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        customer={editingCustomer}
      />
    </>
  );
}
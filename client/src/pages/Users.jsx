import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users as UsersIcon, ShieldCheck, UserCog, UserX, Plus, Pencil, Trash2,
  ChevronLeft, ChevronRight, Search,
} from "lucide-react";
import AddUserModal from "../modal/AddUserModal";
import { fetchAllUsers } from "../redux/slices/userSlice";

const roleClasses = {
  Admin: "bg-violet-50 text-violet-600",
  Manager: "bg-blue-50 text-[#2B54D6]",
  Staff: "bg-slate-100 text-slate-600",
};

const statusClasses = {
  Active: "bg-emerald-50 text-emerald-600",
  Inactive: "bg-rose-50 text-rose-600",
};

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

export default function Users() {
  const dispatch = useDispatch();
  const { loading = false, error = null } = useSelector((state) => state.users) || {};

  console.log("Users component: loading =", loading, ", error =", error);

  const users = useSelector((state) => state.users.users) || [];
  console.log("Users component: users =", users);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All roles");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, role]);

  // derive stats from real data
  const totalUsers = users.length;
  const admins = users.filter((u) => u.role === "admin").length;
  const staff = users.filter((u) => u.role === "staff" || u.role === "manager").length;
  const inactive = users.filter((u) => u.status === "Inactive").length;

  const STATS = [
    { label: "Total users", value: String(totalUsers), icon: UsersIcon, from: "#2B54D6", to: "#4FD5F0", blob: "#2B54D6" },
    { label: "Admins", value: String(admins), icon: ShieldCheck, from: "#5B3FE0", to: "#8B7BFF", blob: "#5B3FE0" },
    { label: "Staff", value: String(staff), icon: UserCog, from: "#0E7C8C", to: "#4FD5C5", blob: "#0E7C8C" },
    { label: "Inactive", value: String(inactive), icon: UserX, from: "#C0392B", to: "#F0836B", blob: "#C0392B" },
  ];

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchesRole = role === "All roles" || u.role === role;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  const paginatedUsers = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

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
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-[#2B54D6]/40"
          >
            <option>All roles</option>
            <option>Admin</option>
            <option>Manager</option>
            <option>Staff</option>
          </select>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#2B54D6] to-[#4FD5F0] px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
          >
            <Plus size={16} />
            Add user
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="bg-[#F7F9FE] text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th className="w-[28%] px-3 py-3 font-medium">Name</th>
                <th className="w-[28%] px-3 py-3 font-medium">Email</th>
                <th className="w-[16%] px-3 py-3 font-medium">Role</th>
                <th className="w-[14%] px-3 py-3 font-medium">Status</th>
                <th className="w-[14%] px-3 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-rose-500">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                    No users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u, i) => (
                  <tr
                    key={u._id || u.email || i}
                    className={`group transition-colors duration-150 hover:bg-[#F7F9FE] ${
                      i > 0 ? "border-t border-slate-50" : ""
                    }`}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2B54D6]/10 to-[#4FD5F0]/10 text-[11px] font-semibold text-[#2B54D6]">
                          {getInitials(u.name)}
                        </div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{u.email}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${roleClasses[u.role] || "bg-slate-100 text-slate-600"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusClasses[u.status] || "bg-slate-100 text-slate-600"}`}>
                        {u.status || "Active"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-[#2B54D6]/10 hover:text-[#2B54D6]">
                          <Pencil size={15} />
                        </button>
                        <button className="rounded-md p-1.5 text-slate-400 transition-colors duration-150 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-around text-sm text-slate-500">
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

      <AddUserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}